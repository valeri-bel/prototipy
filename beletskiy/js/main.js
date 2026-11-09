(function () {
  var t = window.typo || function (s) { return s; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽"; };
  var img = function (n) { return "img/work/" + n + ".jpg"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ALBUMS = window.ALBUMS, PRICES = window.PRICES, PROCESS = window.PROCESS;

  /* Карточка альбома */
  function card(a, i) {
    var n = ("0" + (ALBUMS.indexOf(a) + 1)).slice(-2);
    return '<a class="work" href="album.html?id=' + a.id + '">' +
      '<span class="work__img"><img loading="lazy" src="' + img(a.cover) + '" alt="' + esc(a.name) + ', пример работы"></span>' +
      '<span class="work__no">№&nbsp;' + n + '</span>' +
      '<span class="work__name">' + esc(t(a.name)) + (a.note ? ' <small>' + esc(t(a.note)) + '</small>' : '') + '</span>' +
      '<span class="work__meta">' + a.count + '&nbsp;фото в профиле</span></a>';
  }

  /* Главная: избранные альбомы */
  var feat = $("#featured");
  if (feat) feat.innerHTML = ALBUMS.slice(0, 6).map(card).join("");

  /* Прайс */
  var pt = $("#priceTable");
  if (pt) pt.innerHTML = PRICES.map(function (p) {
    return '<tr><td>' + esc(t(p.name)) + '</td><td>' + rub(p.price) + '</td><td>за&nbsp;' + (p.unit === "услуга" ? "услугу" : p.unit) + '</td></tr>';
  }).join("");

  /* Расчёт */
  var sel = $("#calcService"), qty = $("#calcQty");
  if (sel && qty) {
    sel.innerHTML = PRICES.filter(function (p) { return p.id !== "learn"; }).map(function (p) { return '<option value="' + p.id + '">' + esc(t(p.name)) + '</option>'; }).join("");
    var draw = function () {
      var p = PRICES.filter(function (x) { return x.id === sel.value; })[0];
      var q = Math.max(1, Math.min(500, parseInt(qty.value, 10) || 1));
      $("#calcSum").textContent = rub(p.price * q);
      $("#calcUnit").textContent = q + " × " + rub(p.price) + " за " + (p.unit === "услуга" ? "услугу" : p.unit);
      $("#calcLabel").textContent = p.unit === "стык" ? "Сколько стыков" : p.unit === "шт." ? "Сколько штук" : "Сколько услуг";
    };
    sel.addEventListener("change", draw);
    qty.addEventListener("input", draw);
    $$("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        qty.value = Math.max(1, Math.min(500, (parseInt(qty.value, 10) || 1) + Number(b.dataset.step)));
        draw();
      });
    });
    draw();
  }

  /* Каталог работ: поиск и фильтр */
  var grid = $("#allWorks");
  if (grid) {
    var chips = $("#chips"), search = $("#search"), found = $("#found"), cur = "all";
    chips.innerHTML = PROCESS.map(function (p) { return '<button type="button" class="chip' + (p.id === "all" ? " is-on" : "") + '" data-p="' + p.id + '">' + esc(p.name) + '</button>'; }).join("");
    var apply = function () {
      var q = search.value.trim().toLowerCase();
      var list = ALBUMS.filter(function (a) {
        var hay = (a.name + " " + (a.note || "") + " " + a.tags.join(" ")).toLowerCase();
        return (cur === "all" || a.process.indexOf(cur) > -1) && (!q || hay.indexOf(q) > -1);
      });
      grid.innerHTML = list.map(card).join("");
      found.textContent = list.length ? "Альбомов: " + list.length : "";
      $("#empty").hidden = list.length > 0;
    };
    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      cur = b.dataset.p;
      $$(".chip", chips).forEach(function (c) { c.classList.toggle("is-on", c === b); });
      apply();
    });
    search.addEventListener("input", apply);
    apply();
  }

  /* Страница альбома */
  var ab = $("#album");
  if (ab) {
    var id = new URLSearchParams(location.search).get("id");
    var a = ALBUMS.filter(function (x) { return x.id === id; })[0] || ALBUMS[0];
    document.title = a.name + " | Геннадий Б., сварщик";
    $("#aName").textContent = t(a.name);
    $("#aNote").textContent = a.note ? t(a.note) : "";
    $("#aCount").textContent = "В профиле " + a.count + " фото, здесь " + a.photos.length;
    $("#aTags").innerHTML = a.tags.map(function (x) { return "<li>" + esc(t(x)) + "</li>"; }).join("");
    var rel = PRICES.filter(function (p) { return a.tags.indexOf(p.tag) > -1 && p.id !== "learn" || (a.id === "elektrod" && p.id === "mma"); });
    $("#aPrices").innerHTML = rel.map(function (p) { return "<li><span>" + esc(t(p.name)) + "</span><b>" + rub(p.price) + "</b></li>"; }).join("");
    $("#aPhotos").innerHTML = a.photos.map(function (n, i) {
      return '<button type="button" class="ph" data-i="' + i + '"><img loading="lazy" src="' + img(n) + '" alt="' + esc(a.name) + ', снимок ' + (i + 1) + '"></button>';
    }).join("");
    var more = ALBUMS.filter(function (x) { return x !== a; }).slice(0, 3);
    $("#aMore").innerHTML = more.map(card).join("");

    /* Просмотр снимка */
    var box = $("#lightbox"), big = $("#lbImg"), pos = 0;
    var show = function (i) {
      pos = (i + a.photos.length) % a.photos.length;
      big.src = img(a.photos[pos]);
      big.alt = a.name + ", снимок " + (pos + 1);
      $("#lbCount").textContent = (pos + 1) + " / " + a.photos.length;
    };
    var close = function () { box.hidden = true; document.body.style.overflow = ""; };
    $("#aPhotos").addEventListener("click", function (e) {
      var b = e.target.closest(".ph");
      if (!b) return;
      show(Number(b.dataset.i));
      box.hidden = false;
      document.body.style.overflow = "hidden";
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { show(pos - 1); });
    $("#lbNext").addEventListener("click", function () { show(pos + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(pos - 1);
      if (e.key === "ArrowRight") show(pos + 1);
    });
  }

  /* Заявка: форма показывает ответ, но ничего не отправляет */
  var form = $("#requestForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.hidden = true;
      $("#formDone").hidden = false;
      $("#formDone").focus();
    });
    var file = $("#file");
    if (file) file.addEventListener("change", function () {
      $("#fileName").textContent = file.files.length ? "Файлов: " + file.files.length : "Фото или чертёж";
    });
  }

  /* Появление при прокрутке */
  var items = $$(".rv");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("js-rv");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (i) { io.observe(i); });
  }
})();
