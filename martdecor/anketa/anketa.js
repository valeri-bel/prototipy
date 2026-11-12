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
  var drafts = {}; // записанные, но ещё не сохранённые: номер вопроса → id в хранилище
  var KEY = readKey();

  function t(s) { return window.typo ? window.typo(s) : s; }
  function endpoint() { return window.BRIEF_ENDPOINT || ""; }
  /* Личный ключ клиента приходит в ссылке (#k=…) и запоминается: по нему страница подтягивает уже отправленные ответы */
  function readKey() {
    var m = /[#&]k=([\w-]+)/.exec(location.hash);
    var key = m ? m[1] : "";
    try {
      if (key) localStorage.setItem(STORE + "-key", key);
      else key = localStorage.getItem(STORE + "-key") || "";
    } catch (e) { /* без хранилища ключ живёт только в ссылке */ }
    return key;
  }

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
      if (!res || !res.ok) {
        var refused = new Error((res && res.error) || "bad response");
        refused.server = true; // скрипт ответил отказом: повтор не поможет
        throw refused;
      }
      return res;
    }, function (err) { clearTimeout(timer); throw err; });
  }

  /* ---------- Записи, которые ждут отправки, живут в IndexedDB: переживают перезагрузку страницы ---------- */
  var AUDIO_DB = STORE + "-audio";
  function audioDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("no indexedDB")); return; }
      var req = indexedDB.open(AUDIO_DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore("pending", { keyPath: "id" }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function audioTx(mode, work) {
    return audioDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("pending", mode);
        var req = work(tx.objectStore("pending"));
        tx.oncomplete = function () { resolve(req && req.result); };
        tx.onerror = tx.onabort = function () { reject(tx.error); };
      });
    });
  }
  function rememberAudio(job) {
    return Promise.resolve().then(function () { return job.blob.arrayBuffer(); }).then(function (buf) {
      return audioTx("readwrite", function (st) {
        return st.put({ id: job.id, n: job.n, mime: job.mime, seconds: job.seconds, draft: !!job.draft, buf: buf });
      });
    }).catch(function () { /* нет хранилища: запись живёт только в памяти */ });
  }
  function forgetAudio(id) {
    return audioTx("readwrite", function (st) { return st.delete(id); }).catch(function () {});
  }
  function restoreAudio() {
    return audioTx("readonly", function (st) { return st.getAll(); }).then(function (rows) {
      (rows || []).forEach(function (row) {
        if (!cards[row.n]) return;
        var blob = new Blob([row.buf], { type: row.mime });
        if (row.draft) {
          if (drafts[row.n]) forgetAudio(drafts[row.n]);
          review(row.n, blob, row.mime, row.seconds, row.id);
          setStatus(row.n, "Здесь осталась ваша запись, которую вы не успели сохранить. Послушайте и сохраните.");
          return;
        }
        voiceQueue.push({ id: row.id, n: row.n, mime: row.mime, seconds: row.seconds, blob: blob });
        setStatus(row.n, "Отправляем запись, сделанную раньше…");
      });
    }).catch(function () {});
  }
  function toBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(blob);
    });
  }
  /* Браузеры называют формат по-разному (video/mp4, audio/x-m4a…): приводим к тому, что принимает скрипт */
  function audioType(raw) {
    var t = String(raw || "").toLowerCase();
    if (t.indexOf("mp4") >= 0 || t.indexOf("m4a") >= 0 || t.indexOf("aac") >= 0) return "audio/mp4";
    if (t.indexOf("ogg") >= 0) return "audio/ogg";
    return "audio/webm";
  }

  /* Ответы, которые уже лежат в Таблице: подтягиваем их, если на этом устройстве их нет */
  function loadFromServer() {
    if (!endpoint() || !KEY) return Promise.resolve();
    setSave("Загружаем ваши ответы…");
    return post({ action: "load", key: KEY }, 45000).then(function (res) {
      Object.keys(res.answers || {}).forEach(function (n) {
        if (!cards[n]) return;
        var server = String(res.answers[n]);
        var local = state.answers[n] || "";
        if (local === (state.sent[n] || "")) {
          // здесь нет неотправленных правок: показываем то, что в Таблице
          state.answers[n] = server;
          cards[n].area.value = server;
          grow(cards[n].area);
        }
        state.sent[n] = server;
      });
      Object.keys(res.voices || {}).forEach(function (n) {
        if (!cards[n]) return;
        var list = state.voices[n] || [];
        while (list.length < res.voices[n]) list.push({});
        state.voices[n] = list;
        if (!drafts[n] && (!active || String(active.n) !== n)) idleVoice(Number(n));
        if (!cards[n].status.textContent) showSavedVoices(Number(n));
      });
      persist();
      updateProgress();
      setSave("Ваши ответы на месте");
    }).catch(function () { setSave(""); });
  }

  /* Отправляем по одному: сначала голосовые, потом изменённые тексты */
  function pump() {
    if (sending || !endpoint()) return;
    var job = voiceQueue[0];
    if (job) {
      sending = true;
      setStatus(job.n, "Сохраняем запись…");
      toBase64(job.blob).then(function (audio) {
        return post({ action: "voice", n: job.n, mime: job.mime, audio: audio, seconds: job.seconds }, 240000);
      }).then(function () {
        voiceQueue.shift();
        forgetAudio(job.id);
        (state.voices[job.n] = state.voices[job.n] || []).push({ seconds: job.seconds, at: Date.now() });
        persist();
        updateProgress();
        if (!active || active.n !== job.n) idleVoice(job.n);
        setStatus(job.n, "Запись сохранена. Голосовых ответов: " + state.voices[job.n].length);
        next();
      }, function (err) {
        if (err && err.server) {
          voiceQueue.shift();
          forgetAudio(job.id);
          setStatus(job.n, "Запись не сохранилась. Попробуйте записать короче или ответьте текстом.", true);
          next();
          return;
        }
        fail(job.n, "Запись пока не отправилась, пробуем ещё раз. Она сохранена на этом устройстве и не пропадёт.");
      });
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
    if (drafts[n]) { forgetAudio(drafts[n]); delete drafts[n]; }
    setStatus(n, "Разрешите доступ к микрофону, если браузер спросит.");
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var mime = pickMime();
      // 32 кбит/с хватает для голоса, а файл в 4 раза легче: телефону проще его отправить
      var rec;
      try {
        rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
      } catch (e) {
        rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      }
      var chunks = [];
      active = { n: n, rec: rec, stream: stream, seconds: 0 };
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var seconds = active ? active.seconds : 0;
        stream.getTracks().forEach(function (track) { track.stop(); });
        clearInterval(active && active.tick);
        active = null;
        var type = audioType(rec.mimeType || mime);
        review(n, new Blob(chunks, { type: type }), type, seconds);
      };
      // Без нарезки на куски: на iPhone склейка кусков даёт битый файл
      rec.start();
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
  function review(n, blob, mime, seconds, id) {
    clearVoice(n);
    if (!blob.size) {
      setStatus(n, "Запись получилась пустой. Попробуйте ещё раз.", true);
      idleVoice(n);
      return;
    }
    if (!id) {
      // Сразу кладём запись на устройство: если страница перезагрузится до «Сохранить», она не пропадёт
      id = Date.now() + "-" + n;
      rememberAudio({ id: id, n: n, mime: mime, seconds: seconds, blob: blob, draft: true });
    }
    drafts[n] = id;
    var url = URL.createObjectURL(blob);
    var player = el("audio");
    player.controls = true;
    player.src = url;
    var box = cards[n].voice;
    box.appendChild(player);
    box.appendChild(button("Сохранить запись", "btn--main", function () { keep(n, blob, mime, seconds, url, id); }));
    box.appendChild(button("Записать заново", "", function () {
      URL.revokeObjectURL(url);
      forgetAudio(id);
      delete drafts[n];
      setStatus(n, "");
      idleVoice(n);
    }));
    setStatus(n, "Послушайте и сохраните, если всё хорошо. Запись длится " + clock(seconds) + ".");
  }
  function keep(n, blob, mime, seconds, url, id) {
    if (!endpoint()) {
      setStatus(n, "Отправка пока не подключена, запись не сохранилась.", true);
      return;
    }
    var job = { id: id || Date.now() + "-" + n, n: n, mime: mime, seconds: seconds, blob: blob };
    delete drafts[n];
    URL.revokeObjectURL(url);
    idleVoice(n);
    setStatus(n, "Сохраняем запись…");
    // Сначала кладём запись на устройство, потом отправляем: если страница перезагрузится, она уйдёт при следующем открытии
    rememberAudio(job).then(function () {
      voiceQueue.push(job);
      pump();
    });
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
  restoreAudio().then(loadFromServer).then(function () {
    if (endpoint() && (dirtyText() || voiceQueue.length)) pump();
  });
})();
