(function () {
  var t = window.typo || function (s) { return s; };
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  /* Расписание: статус считается по сегодняшней дате */
  var list = document.getElementById("schedule");
  if (list) {
    window.SCHEDULE.forEach(function (row) {
      var to = new Date(row.to + "T23:59:59");
      var from = new Date(row.from + "T00:00:00");
      var state = to < today ? "past" : from <= new Date() ? "now" : "soon";
      var word = { past: "Прошло", now: "Идёт приём", soon: "Открыта запись" }[state];
      var li = document.createElement("li");
      li.className = "slot slot--" + state;

      var city = document.createElement("strong");
      city.className = "slot__city";
      city.textContent = row.city;
      var date = document.createElement("span");
      date.className = "slot__date";
      date.textContent = t(row.label);
      var note = document.createElement("span");
      note.className = "slot__note";
      note.textContent = t(row.note);
      var badge = document.createElement("span");
      badge.className = "slot__state";
      badge.textContent = t(word);

      li.appendChild(city);
      li.appendChild(date);
      li.appendChild(note);
      li.appendChild(badge);
      list.appendChild(li);
    });
  }

  /* Подбор формата */
  var quiz = document.getElementById("quiz");
  var form = document.getElementById("lead");
  var answers = {};

  function pick() {
    var place = answers.place;
    var need = answers.need;
    if (!place || !need) return null;
    if (need === "look") return "meeting";
    if (need === "talk") return "online";
    return place === "other" ? "online" : "live";
  }

  function setFormat(name) {
    var field = document.getElementById("format");
    if (field && name) field.value = name;
  }

  function setCity(name) {
    var field = document.getElementById("city");
    if (field && name) field.value = name;
  }

  if (quiz) {
    quiz.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-q]");
      if (!btn) return;
      var q = btn.dataset.q;
      answers[q] = btn.dataset.a;
      quiz.querySelectorAll('button[data-q="' + q + '"]').forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      var key = pick();
      if (!key) return;
      var res = window.RESULTS[key];
      var box = document.getElementById("result");
      box.hidden = false;
      document.getElementById("result-title").textContent = t(res.title);
      document.getElementById("result-text").textContent = t(res.text);
      var go = document.getElementById("result-go");
      go.dataset.format = res.format;
      go.dataset.city = answers.place === "alm" ? "Альметьевск" : answers.place === "ufa" ? "Уфа" : "Другой город";
    });
  }

  document.querySelectorAll("[data-format]").forEach(function (a) {
    a.addEventListener("click", function () {
      setFormat(a.dataset.format);
      if (a.dataset.city) setCity(a.dataset.city);
    });
  });

  /* Форма — демонстрация: ничего никуда не отправляется */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.hidden = true;
      document.getElementById("thanks").hidden = false;
    });
  }

  /* Появление блоков при прокрутке */
  var items = document.querySelectorAll(".reveal");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }
})();
