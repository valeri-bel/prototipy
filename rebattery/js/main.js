(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽"; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
  var t = function (s) { return esc(window.typo(s)); };
  var param = function (k) { return new URLSearchParams(location.search).get(k); };

  /* Режим работы: Вт–Сб 10–21 по Москве */
  function openNow() {
    var d = new Date(Date.now() + 3 * 3600 * 1000), wd = d.getUTCDay(), h = d.getUTCHours();
    if (wd >= 2 && wd <= 6 && h >= 10 && h < 21) return { on: 1, s: "Открыто до 21:00" };
    var nx = (wd === 0 || wd === 1 || (wd === 6 && h >= 21)) ? "во вторник" : (h < 10 ? "сегодня" : "завтра");
    return { on: 0, s: "Закрыто, откроемся " + nx + " в 10:00" };
  }

  function shell() {
    var o = openNow();
    var top = $("#shell-top");
    if (top) top.innerHTML =
      '<div class="top"><div class="wrap"><span class="openst ' + (o.on ? "on" : "") + '"><i></i>' + o.s + '</span>' +
      '<span class="hide">Метро Чертановская, парковка у входа</span><span class="sp"></span>' +
      '<a href="' + SITE.wa + '" target="_blank" rel="noopener">WhatsApp</a><a href="' + SITE.tg + '" target="_blank" rel="noopener">Telegram</a></div></div>' +
      '<header class="hdr"><div class="wrap" style="position:relative"><a class="logo" href="index.html"><b>РЕБЭТТЕРИ</b><span>Аккумуляторный сервис №1</span></a>' +
      '<nav class="nav" id="nav"><a class="sos" href="index.html#road"><i class="ti ti-urgent"></i> Помощь на дороге</a><a href="catalog.html">Каталог</a><a href="index.html#services">Услуги и цены</a><a href="index.html#reviews">Отзывы</a><a href="index.html#contacts">Контакты</a></nav>' +
      '<a class="tel" href="tel:' + SITE.tel + '">' + SITE.phone + '</a><button class="burger" id="burger" aria-label="Меню"><i class="ti ti-menu-2"></i></button></div></header>';
    var f = $("#shell-foot");
    if (f) f.innerHTML =
      '<footer class="foot"><div class="wrap"><div class="g"><div><div class="logo"><b>РЕБЭТТЕРИ</b><span>Аккумуляторный сервис №1</span></div><p>' + t("Сначала восстанавливаем, и только потом предлагаем замену.") + '</p></div>' +
      '<div><h3>Разделы</h3><a href="catalog.html">Каталог</a><br><a href="index.html#road">Помощь на дороге</a><br><a href="index.html#services">Услуги и цены</a><br><a href="article.html?id=podbor">Советы</a></div>' +
      '<div><h3>Контакты</h3><a href="tel:' + SITE.tel + '">' + SITE.phone + '</a><br>' + t(SITE.addr) + '<br>' + t(SITE.hours) + '</div></div>' +
      '<div class="proto">' + t("Это прототип: кнопки и формы ничего не отправляют, вместо фотографий заглушки, подбор по авто и наличие показаны для примера. Цены товаров с ребэттери.рф, цены услуг с Яндекс Карт, на 08.11.2026.") + ' Подготовила Валерия Белецкая.</div></div></footer>' +
      '<a class="fab" href="tel:' + SITE.tel + '"><i class="ti ti-phone"></i>&nbsp;Позвонить</a>';
    var b = $("#burger");
    if (b) b.onclick = function () { $("#nav").classList.toggle("open"); };
  }

  /* Заглушка фото: рисунок аккумулятора с ёмкостью и полярностью */
  function batt(it) {
    var cap = it.cap ? it.cap + " А·ч" : "ИБП";
    var plusLeft = /L\+/.test(it.pol);
    return '<svg viewBox="0 0 160 120" role="img" aria-label="Заглушка фото: ' + esc(it.b) + '">' +
      '<rect x="' + (plusLeft ? 20 : 112) + '" y="10" width="28" height="12" rx="3" fill="#C93A2B"/>' +
      '<rect x="' + (plusLeft ? 112 : 20) + '" y="10" width="28" height="12" rx="3" fill="#2B3A47"/>' +
      '<rect x="6" y="20" width="148" height="92" rx="9" fill="#0B2A45"/>' +
      '<rect x="6" y="20" width="148" height="20" rx="9" fill="#123A5C"/>' +
      '<text x="80" y="66" text-anchor="middle" font-family="Unbounded,sans-serif" font-size="15" font-weight="700" fill="#fff">' + esc(it.b) + '</text>' +
      '<text x="80" y="92" text-anchor="middle" font-family="Golos Text,sans-serif" font-size="16" fill="#FFC83D">' + esc(cap) + '</text></svg>';
  }

  function prodCard(it) {
    var ch = ['<span class="chip">' + esc(it.tech) + '</span>'];
    if (it.pol !== "—") ch.push('<span class="chip">' + esc(it.pol) + '</span>');
    return '<a class="prod" href="item.html?id=' + it.id + '"><div class="pic">' + batt(it) + '</div><div class="nm">' + t(it.name) + '</div><div class="chips">' + ch.join("") + '</div>' +
      '<div class="ft"><span class="pr">' + fmt(it.price) + '</span><span class="st">В наличии</span></div></a>';
  }

  function fillSelects(mk, md) {
    if (!mk) return;
    mk.innerHTML = '<option value="">Марка</option>' + Object.keys(CARS).map(function (k) { return "<option>" + k + "</option>"; }).join("");
    function models() {
      var o = CARS[mk.value] || {};
      md.innerHTML = '<option value="">Модель</option>' + Object.keys(o).map(function (k) { return "<option>" + k + "</option>"; }).join("");
    }
    mk.onchange = models; models();
  }

  /* Формы-демо */
  function demoForms() {
    $$("form[data-demo]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var d = $(".done", f);
        if (d) d.style.display = "block";
      });
    });
  }

  /* Главная */
  var TRI = {
    now: { t: "Вызовите мастера к машине", d: "Откроет, прикурит, заведёт или заменит аккумулятор. Прикурить, завести, заменить: 2 500 ₽.", a: '<a class="btn y" href="tel:' + SITE.tel + '">Позвонить</a><a class="btn l" href="#road">Заявка на выезд</a>' },
    weak: { t: "Приезжайте на бесплатную диагностику", d: "Проверим АКБ и генератор. Если поможет зарядка или восстановление, новый покупать не придётся.", a: '<a class="btn y" href="#contacts">Как доехать</a><a class="btn l" href="#services">Цены на услуги</a>' },
    fresh: { t: "Подберём новый по вашей машине", d: "Укажите марку и модель. В каталоге 1343 легковых аккумулятора, специалист сверит совместимость.", a: '<a class="btn y" href="#pick">Подобрать по авто</a><a class="btn l" href="catalog.html">Открыть каталог</a>' },
    old: { t: "Сдайте старый аккумулятор", d: "При покупке нового сделаем скидку за старый. Скупаем любые свинцовые, можем приехать и забрать.", a: '<a class="btn y" href="#old">Условия</a><a class="btn l" href="' + SITE.wa + '" target="_blank" rel="noopener">Написать в WhatsApp</a>' }
  };
  function home() {
    var box = $("#tri"); if (!box) return;
    function pick(k) {
      $$("button", box).forEach(function (b) { b.classList.toggle("on", b.dataset.k === k); });
      var a = TRI[k];
      $("#ans").innerHTML = '<b class="t">' + t(a.t) + '</b><div>' + t(a.d) + '</div><div class="row">' + a.a + '</div>';
    }
    $$("button", box).forEach(function (b) { b.onclick = function () { pick(b.dataset.k); }; });
    pick("now");

    $("#services-list").innerHTML = SERVICES.map(function (s) {
      return '<div class="card svc"><i class="ti ' + s.i + ' ic"></i><h3>' + t(s.n) + '</h3><div class="muted">' + t(s.d) + '</div><div class="pr ' + (s.free ? "free" : "") + '">' + t(s.p) + '</div></div>';
    }).join("");

    $("#road-cols").innerHTML = ROAD.map(function (g) {
      return '<div><h3>' + t(g.t) + '</h3><ul>' + g.l.map(function (x) { return "<li>" + t(x) + "</li>"; }).join("") + "</ul></div>";
    }).join("");

    $("#cats").innerHTML = CATS.slice(0, 8).map(function (c) {
      return '<a class="cat" href="catalog.html"><i class="ti ' + c.i + '"></i><div><b>' + t(c.n) + '</b><span>' + c.c + ' товаров</span></div></a>';
    }).join("");

    $("#top-items").innerHTML = ["v60r", "m75r", "m70a", "v60a"].map(function (id) {
      return prodCard(ITEMS.filter(function (x) { return x.id === id; })[0]);
    }).join("");

    $("#reviews-list").innerHTML = REVIEWS.map(function (r) {
      return '<div class="card rv"><div class="stars">★★★★★</div><div>' + t(r.t) + '</div><footer>' + esc(r.a) + ', ' + r.d + ', Яндекс Карты</footer></div>';
    }).join("");

    $("#articles").innerHTML = ARTICLES.map(function (a) {
      return '<a class="card art" href="article.html?id=' + a.id + '"><div class="ph">' + t(a.ph) + '</div><h3>' + t(a.t) + '</h3><p class="muted">' + t(a.lead) + '</p></a>';
    }).join("");

    $("#faq").innerHTML = FAQ.map(function (f) {
      return "<details><summary>" + t(f.q) + "</summary><p>" + t(f.a) + "</p></details>";
    }).join("");

    fillSelects($("#mk"), $("#md"));
    $("#pickf").onsubmit = function (e) {
      e.preventDefault();
      var mk = $("#mk").value, md = $("#md").value;
      location.href = "catalog.html" + (mk && md ? "?make=" + encodeURIComponent(mk) + "&model=" + encodeURIComponent(md) : "");
    };
  }

  /* Каталог */
  function catalog() {
    var grid = $("#grid"); if (!grid) return;
    var state = { cat: "car", q: "", cap: "", pol: "", tech: "", car: null };
    var mk = param("make"), md = param("model");
    if (mk && md && CARS[mk] && CARS[mk][md]) state.car = { n: mk + " " + md, r: CARS[mk][md] };

    var tabs = [["car", "Легковые"], ["truck", "Грузовые"], ["moto", "Мото"], ["ups", "ИБП и тяговые"]];
    $("#tabs").innerHTML = tabs.map(function (x) { return '<button data-c="' + x[0] + '">' + x[1] + "</button>"; }).join("");

    function counts() {
      var c = CATS.filter(function (x) { return x.id === state.cat; })[0];
      return c ? c.c : 0;
    }
    function draw() {
      $$("#tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.c === state.cat); });
      var list = ITEMS.filter(function (i) {
        if (i.cat !== state.cat) return false;
        if (state.q && i.name.toLowerCase().indexOf(state.q) < 0) return false;
        if (state.cap) { var p = state.cap.split("-"); if (i.cap < +p[0] || i.cap > +p[1]) return false; }
        if (state.pol && i.pol.indexOf(state.pol) < 0) return false;
        if (state.tech && i.tech !== state.tech) return false;
        if (state.car) {
          var r = state.car.r;
          if (i.cap < r.cap[0] || i.cap > r.cap[1] || i.pol !== r.pol) return false;
          if (r.tech && i.tech !== r.tech) return false;
        }
        return true;
      });
      $("#carline").style.display = state.car ? "block" : "none";
      if (state.car) $("#carline").innerHTML = "Подходит для <b>" + esc(state.car.n) + "</b>: показаны только совместимые. <a href='catalog.html'>Сбросить</a> <span class='muted'>(подбор для примера)</span>";
      $("#info").textContent = "Показано " + list.length + " из выборки. На настоящем сайте в разделе " + counts() + " товаров.";
      grid.innerHTML = list.length ? list.map(prodCard).join("") : '<div class="empty">' + t("По этим условиям в выборке пусто. Сбросьте фильтр или напишите нам, подберём вручную.") + "</div>";
    }
    $("#tabs").onclick = function (e) { if (e.target.dataset.c) { state.cat = e.target.dataset.c; state.car = null; draw(); } };
    $("#q").oninput = function (e) { state.q = e.target.value.trim().toLowerCase(); draw(); };
    $("#fcap").onchange = function (e) { state.cap = e.target.value; draw(); };
    $("#fpol").onchange = function (e) { state.pol = e.target.value; draw(); };
    $("#ftech").onchange = function (e) { state.tech = e.target.value; draw(); };
    fillSelects($("#mk2"), $("#md2"));
    $("#carf").onsubmit = function (e) {
      e.preventDefault();
      var a = $("#mk2").value, b = $("#md2").value;
      if (a && b) { state.cat = "car"; state.car = { n: a + " " + b, r: CARS[a][b] }; draw(); }
    };
    draw();
  }

  /* Карточка */
  function item() {
    var box = $("#item"); if (!box) return;
    var it = ITEMS.filter(function (x) { return x.id === param("id"); })[0] || ITEMS[0];
    document.title = it.name + " · РеБэттери";
    $("#crumb-name").textContent = it.name;
    $("#ttl").textContent = window.typo(it.name);
    var rows = [["Бренд", it.b], ["Ёмкость", it.cap ? it.cap + " А·ч" : ""], ["Полярность", it.pol === "—" ? "" : it.pol], ["Технология", it.tech], ["Пусковой ток", it.en ? it.en + " А (EN)" : ""], ["Габариты, мм", it.size || ""]];
    box.innerHTML = '<div><div class="big">' + batt(it) + '</div><p class="src-note">' + t("Вместо фото заглушка. Цена и характеристики: " + it.src + ".") + '</p>' +
      '<table class="spec">' + rows.filter(function (r) { return r[1]; }).map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</table></div>" +
      '<div><div class="st">В наличии (для примера)</div><div style="font:600 34px var(--head);margin:6px 0">' + fmt(it.price) + '</div>' +
      '<p class="muted">' + t("Итог виден до заказа: сколько стоит сам аккумулятор, установка и приезд мастера.") + '</p>' +
      '<div class="opt" id="opts">' +
      '<label><input type="radio" name="g" value="self" checked><span><b>Заберу сам</b><br><span class="muted small">' + t("Чертановская, парковка у входа, Вт–Сб 10:00–21:00") + '</span></span></label>' +
      '<label><input type="radio" name="g" value="inst"><span><b>Установить в сервисе</b><br><span class="muted small">' + t("Снимем старый, поставим новый, проверим") + '</span></span></label>' +
      '<label><input type="radio" name="g" value="road"><span><b>Привезти и заменить у машины</b><br><span class="muted small">' + t("Мастер приедет с аккумулятором") + '</span></span></label></div>' +
      '<label class="opt" style="margin:0"><label><input type="checkbox" id="old"><span><b>Сдаю старый аккумулятор</b><br><span class="muted small">' + t("Скидка за старый при покупке нового") + '</span></span></label></label>' +
      '<div class="sum" id="sum"></div>' +
      '<form class="form" style="padding:0;background:none" data-demo><input placeholder="Телефон" type="tel" required><button class="btn y full">Заказать</button><div class="done">' + t("Это прототип, заявка никуда не отправлена.") + '</div></form></div>';
    function sum() {
      var g = $("input[name=g]:checked").value, old = $("#old").checked;
      var h = '<div><span>Аккумулятор</span><b>' + fmt(it.price) + "</b></div>";
      if (g === "inst") h += '<div><span>Установка</span><span class="need">нужна цена от вас</span></div>';
      if (g === "road") h += '<div><span>Приезд и замена</span><b>2 500 ₽</b></div>';
      if (old) h += '<div><span>Скидка за старый</span><span class="need">нужен размер скидки</span></div>';
      var tot = it.price + (g === "road" ? 2500 : 0);
      var lab = g === "inst" ? "Итого без установки" : (old ? "Итого до скидки" : "Итого");
      h += '<div class="tot"><span>' + lab + '</span><span>' + fmt(tot) + "</span></div>";
      $("#sum").innerHTML = h;
    }
    $$("input", box).forEach(function (i) { i.addEventListener("change", sum); });
    sum();
    $("#more").innerHTML = ITEMS.filter(function (x) { return x.cat === it.cat && x.id !== it.id; }).slice(0, 4).map(prodCard).join("");
  }

  /* Статья */
  function article() {
    var box = $("#art"); if (!box) return;
    var a = ARTICLES.filter(function (x) { return x.id === param("id"); })[0] || ARTICLES[0];
    document.title = a.t + " · РеБэттери";
    $("#art-t").textContent = window.typo(a.t);
    box.innerHTML = '<p style="font-size:21px">' + t(a.lead) + "</p>" + a.b.map(function (b) {
      if (b[0] === "p") return "<p>" + t(b[1]) + "</p>";
      if (b[0] === "need") return '<p class="need">' + t(b[1]) + "</p>";
      return "<" + b[0] + ">" + b[1].map(function (x) { return "<li>" + t(x) + "</li>"; }).join("") + "</" + b[0] + ">";
    }).join("") + '<p style="margin-top:26px"><a class="btn y" href="tel:' + SITE.tel + '">Позвонить</a> <a class="btn n" href="catalog.html">В каталог</a></p>';
  }

  function reveal() {
    var els = $$(".rise");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }

  shell(); home(); catalog(); item(); article(); demoForms(); reveal();
})();
