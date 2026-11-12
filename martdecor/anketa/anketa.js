/* Бриф на странице: черновик хранится в браузере, ответы уходят в Google Таблицу через Apps Script. */
(function () {
  "use strict";

  var STORE = "brief-martdecor-v1";
  var MAX_SECONDS = 600;
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var questions = window.BRIEF.questions;
  var state = load();
  var cards = {};
  var timers = {};
  var voiceQueue = [];
  var sending = false;
  var retryTimer = null;
  var active = null; // текущая запись

  function t(s) { return window.typo ? window.typo(s) : s; }
  function endpoint() { return window.BRIEF_ENDPOINT || ""; }

  function load() {
    var empty = { answers: {}, sent: {}, voices: {} };
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return empty;
      var saved = JSON.parse(raw);
      return { answers: saved.answers || {}, sent: saved.sent || {}, voices: saved.voices || {} };
    } catch (e) { return empty; }
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* приватный режим: работаем без черновика */ }
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function fillNote(node, text) {
    text.split(/(https?:\/\/\S+)/).forEach(function (part) {
      if (/^https?:\/\//.test(part)) {
        var a = el("a", "", part);
        a.href = part; a.target = "_blank"; a.rel = "noopener";
        node.appendChild(a);
      } else if (part) {
        node.appendChild(document.createTextNode(t(part)));
      }
    });
  }
  function clock(sec) {
    return Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0");
  }

  /* ---------- Отрисовка ---------- */
  function render() {
    var form = document.getElementById("form");
    var section = null, box = null;
    questions.forEach(function (q, i) {
      var n = i + 1;
      if (q.section !== section) {
        section = q.section;
        box = el("section", "sec");
        box.appendChild(el("h2", "", t(section)));
        form.appendChild(box);
      }
      box.appendChild(card(q, n));
    });
    updateProgress();
  }

  function card(q, n) {
    var root = el("article", "q");
    root.id = "q" + n;
    var head = el("div", "q__head");
    head.appendChild(el("span", "q__n", String(n)));
    var title = el("label", "q__title", t(q.question));
    title.htmlFor = "a" + n;
    head.appendChild(title);
    root.appendChild(head);
    if (q.note) {
      var note = el("p", "q__note");
      fillNote(note, q.note);
      root.appendChild(note);
    }
    var body = el("div", "q__body");
    var area = el("textarea");
    area.id = "a" + n;
    area.value = state.answers[n] || "";
    area.placeholder = "Ваш ответ";
    area.addEventListener("input", function () { grow(area); onType(n, area.value); });
    area.addEventListener("blur", function () { flushTyping(n); });
    body.appendChild(area);

    var voice = el("div", "voice");
    body.appendChild(voice);
    var status = el("p", "q__state");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    body.appendChild(status);
    root.appendChild(body);

    cards[n] = { area: area, voice: voice, status: status };
    idleVoice(n);
    showSavedVoices(n);
    setTimeout(function () { grow(area); }, 0);
    return root;
  }
  function grow(area) {
    area.style.height = "auto";
    area.style.height = area.scrollHeight + 2 + "px";
  }
  function button(label, cls, onClick, html) {
    var b = el("button", "btn" + (cls ? " " + cls : ""));
    b.type = "button";
    if (html) b.innerHTML = html;
    b.appendChild(document.createTextNode(label));
    b.addEventListener("click", onClick);
    return b;
  }
  function setStatus(n, text, isError) {
    cards[n].status.textContent = text || "";
    cards[n].status.classList.toggle("is-error", !!isError);
  }
  function showSavedVoices(n) {
    var count = (state.voices[n] || []).length;
    if (count) setStatus(n, "Голосовых ответов сохранено: " + count);
  }

  function answered(n) {
    return !!((state.answers[n] || "").trim() || (state.voices[n] || []).length);
  }
  function updateProgress() {
    var done = questions.filter(function (q, i) { return answered(i + 1); }).length;
    document.getElementById("progress-label").textContent = "Заполнено " + done + " из " + questions.length;
    document.getElementById("progress-fill").style.width = (done / questions.length * 100) + "%";
  }
  function setSave(text, isError) {
    var node = document.getElementById("save-label");
    node.textContent = text;
    node.classList.toggle("is-error", !!isError);
  }

  /* ---------- Текст ---------- */
  function onType(n, value) {
    state.answers[n] = value;
    persist();
    updateProgress();
    clearTimeout(timers[n]);
    timers[n] = setTimeout(pump, 1200);
    if (endpoint()) setSave("Сохраняем…");
    else setSave("Черновик сохранён на этом устройстве");
  }
  function flushTyping(n) {
    clearTimeout(timers[n]);
    pump();
  }
  function dirtyText() {
    for (var i = 1; i <= questions.length; i++) {
      if ((state.answers[i] || "") !== (state.sent[i] || "")) return i;
    }
    return 0;
  }
  function hasPending() { return !!(dirtyText() || voiceQueue.length || sending); }

  function post(payload, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs);
    return fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: ctrl.signal
    }).then(function (r) { return r.json(); }).then(function (res) {
      clearTimeout(timer);
      if (!res || !res.ok) throw new Error((res && res.error) || "bad response");
      return res;
    }, function (err) { clearTimeout(timer); throw err; });
  }

  /* Отправляем по одному: сначала голосовые, потом изменённые тексты */
  function pump() {
    if (sending || !endpoint()) return;
    var job = voiceQueue[0];
    if (job) {
      sending = true;
      setStatus(job.n, "Сохраняем запись…");
      post({ action: "voice", n: job.n, mime: job.mime, audio: job.audio, seconds: job.seconds }, 180000).then(function () {
        voiceQueue.shift();
        (state.voices[job.n] = state.voices[job.n] || []).push({ seconds: job.seconds, at: Date.now() });
        persist();
        updateProgress();
        setStatus(job.n, "Запись сохранена. Голосовых ответов: " + state.voices[job.n].length);
        next();
      }, function () { fail(job.n, "Запись пока не отправилась, пробуем ещё раз. Не закрывайте страницу."); });
      return;
    }
    var n = dirtyText();
    if (!n) { setSave("Все ответы сохранены"); return; }
    var value = state.answers[n] || "";
    sending = true;
    setSave("Сохраняем…");
    post({ action: "text", n: n, text: value }, 45000).then(function () {
      state.sent[n] = value;
      persist();
      next();
    }, function () { fail(0, ""); });
  }
  function next() { sending = false; pump(); }
  function fail(n, message) {
    sending = false;
    if (n) setStatus(n, message, true);
    setSave("Нет связи, повторим сами. Черновик не потеряется.", true);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(pump, 8000);
  }
  window.addEventListener("online", pump);
  window.addEventListener("beforeunload", function (e) {
    if (voiceQueue.length || active) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------- Голос ---------- */
  function canRecord() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }
  function pickMime() {
    var list = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    for (var i = 0; i < list.length; i++) {
      if (MediaRecorder.isTypeSupported(list[i])) return list[i];
    }
    return "";
  }
  function clearVoice(n) { cards[n].voice.textContent = ""; }
  function idleVoice(n) {
    clearVoice(n);
    if (!canRecord()) {
      setStatus(n, "В этом браузере запись голоса не работает. Откройте страницу в Chrome или Safari, если хотите ответить голосом.");
      return;
    }
    cards[n].voice.appendChild(button((state.voices[n] || []).length ? "Записать ещё" : "Записать голосом", "", function () { start(n); }, MIC));
  }

  function start(n) {
    if (active) { stop(); return; }
    setStatus(n, "Разрешите доступ к микрофону, если браузер спросит.");
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var mime = pickMime();
      var rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      var chunks = [];
      active = { n: n, rec: rec, stream: stream, seconds: 0 };
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var seconds = active ? active.seconds : 0;
        stream.getTracks().forEach(function (track) { track.stop(); });
        clearInterval(active && active.tick);
        active = null;
        var type = (rec.mimeType || mime || "audio/webm").split(";")[0];
        review(n, new Blob(chunks, { type: type }), type, seconds);
      };
      rec.start(1000);
      setStatus(n, "");
      recordingView(n);
    }, function (err) {
      var denied = err && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setStatus(n, denied
        ? "Браузер не дал доступ к микрофону. Разрешите его в настройках страницы или ответьте текстом."
        : "Не получилось включить микрофон. Проверьте, что он подключён, или ответьте текстом.", true);
    });
  }
  function recordingView(n) {
    clearVoice(n);
    var label = document.createTextNode("Остановить · 0:00");
    var stopBtn = button("", "btn--rec", stop, '<span class="dot"></span>');
    stopBtn.appendChild(label);
    cards[n].voice.appendChild(stopBtn);
    active.tick = setInterval(function () {
      active.seconds += 1;
      label.nodeValue = "Остановить · " + clock(active.seconds);
      if (active.seconds >= MAX_SECONDS) stop();
    }, 1000);
  }
  function stop() {
    if (active && active.rec.state !== "inactive") active.rec.stop();
  }
  function review(n, blob, mime, seconds) {
    clearVoice(n);
    if (!blob.size) {
      setStatus(n, "Запись получилась пустой. Попробуйте ещё раз.", true);
      idleVoice(n);
      return;
    }
    var url = URL.createObjectURL(blob);
    var player = el("audio");
    player.controls = true;
    player.src = url;
    var box = cards[n].voice;
    box.appendChild(player);
    box.appendChild(button("Сохранить запись", "btn--main", function () { keep(n, blob, mime, seconds, url); }));
    box.appendChild(button("Записать заново", "", function () { URL.revokeObjectURL(url); setStatus(n, ""); idleVoice(n); }));
    setStatus(n, "Послушайте и сохраните, если всё хорошо. Запись длится " + clock(seconds) + ".");
  }
  function keep(n, blob, mime, seconds, url) {
    if (!endpoint()) {
      setStatus(n, "Отправка пока не подключена, запись не сохранилась.", true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      voiceQueue.push({ n: n, mime: mime, seconds: seconds, audio: String(reader.result).split(",")[1] });
      URL.revokeObjectURL(url);
      idleVoice(n);
      setStatus(n, "Сохраняем запись…");
      pump();
    };
    reader.onerror = function () { setStatus(n, "Не получилось прочитать запись. Попробуйте ещё раз.", true); };
    reader.readAsDataURL(blob);
  }

  /* ---------- Готово ---------- */
  document.getElementById("done").addEventListener("click", function () {
    var msg = document.getElementById("done-msg");
    var btn = this;
    if (!endpoint()) { msg.textContent = "Отправка пока не подключена."; return; }
    if (active) { msg.textContent = "Сначала остановите запись голоса."; return; }
    msg.textContent = "Сохраняем последние ответы…";
    btn.disabled = true;
    var waited = 0;
    (function wait() {
      if (hasPending()) {
        pump();
        waited += 500;
        if (waited > 120000) {
          msg.textContent = "Не все ответы успели сохраниться. Проверьте интернет и нажмите ещё раз.";
          btn.disabled = false;
          return;
        }
        setTimeout(wait, 500);
        return;
      }
      post({ action: "done" }, 45000).then(function () {
        msg.textContent = "Спасибо! Бриф у Валерии. Если вспомните что-то ещё, допишите и нажмите кнопку снова.";
        btn.disabled = false;
      }, function () {
        msg.textContent = "Ответы сохранены, но уведомление не отправилось. Нажмите кнопку ещё раз.";
        btn.disabled = false;
      });
    })();
  });

  render();
  if (endpoint() && dirtyText()) pump();
})();
