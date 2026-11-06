/* Вариант Б: функции и блоки по принципам каталога-журнала — бегущая строка, мега-меню, слайдер,
   тематические карусели, комнаты, бейджи и свотчи. Данные — те же из data.js. */
(function () {
  var D = window.MD, T = window.typo || function (s) { return s; };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function t(s) { return esc(T(s)); }
  var page = document.body.getAttribute("data-page");

  /* Комнаты: что показываем — из постов клиента */
  D.rooms = [
    { id: "living", name: "Гостиная", key: "Гостиная", lead: "Акцентная стена у зоны TV или обеденного стола — небольшой площади достаточно, чтобы преобразить комнату.", src: "Пост ВК от 27.10.2023", tone: "linear-gradient(160deg,#7A3340,#45151D)" },
    { id: "bedroom", name: "Спальня", key: "Спальня", lead: "Стена за изголовьем кровати — главный акцент спальни: панно, обои, мягкие текстуры.", src: "Пост ВК от 03.07.2024", tone: "linear-gradient(160deg,#C9BCA6,#8E7F68)" },
    { id: "kids", name: "Детская", key: "Детская", lead: "Фрески с животными и природой, сюжет дорабатывается под вашу стену.", src: "Посты ВК от 28.10.2023 и 25.02.2025", tone: "linear-gradient(160deg,#8FA582,#5B7650)" },
    { id: "kitchen", name: "Кухня", key: "Кухня", lead: "3D-панели выдерживают зону мойки и электроплиты — их клеят даже на фасады.", src: "Пост ВК от 27.10.2023", tone: "linear-gradient(160deg,#D9D3C8,#A89A80)" },
    { id: "bath", name: "Ванная", key: "Ванная", lead: "Фотопечать любого изображения на плитке и мозаике, стальные панели для влажных зон.", src: "Пост ВК от 05.02.2025", tone: "linear-gradient(160deg,#CFD1CB,#9A9D96)" },
    { id: "commerce", name: "Рестораны и офисы", key: "Коммерция", lead: "Материалы с пожаробезопасностью КМ1 и решения для стен в ресторанах.", src: "Посты ВК от 28.08.2024 и 01.04.2026", tone: "linear-gradient(160deg,#6B5547,#2E2420)" }
  ];
  var NEW = ["flexstone", "hikari"], KM1 = ["flexstone"];
  var SW = { acoustic: [["#6B4A35", "Дуб Маррон"], ["#A0663E", "Дуб медный"], ["#B9B6AE", "Платина матовая"]],
             film600: [["#8C6B4E", "Дерево"], ["#D8D3CB", "Камень"], ["#3A302C", "Кожа"]],
             seamless: [["#E7E0D4", "Холст"], ["#D2C3A8", "Песок"], ["#B4A99A", "Штукатурка"], ["#7A5A5E", "Бархат"]] };

  window.MDB_BADGES = function (i) {
    var b = "";
    if (NEW.indexOf(i.id) >= 0) b += '<span class="bdg new">Новинка 2026</span>';
    if (KM1.indexOf(i.id) >= 0) b += '<span class="bdg">КМ1</span>';
    if (!i.price) b += '<span class="bdg">Цена по запросу</span>';
    return b;
  };
  window.MDB_SWATCH = function (i) {
    var s = SW[i.id]; if (!s) return "";
    return '<div class="sw-row">' + s.map(function (c) { return '<span title="' + esc(c[1]) + '" style="background:' + c[0] + '"></span>'; }).join("") + '<small>' + s.length + " " + (s.length < 5 ? "варианта" : "вариантов") + "</small></div>";
  };

  /* Бегущая строка: выгоды клиента его словами */
  var ann = ["Подбор всех материалов для стен — не более 6 часов", "Образцы лепнины и 3D-панелей Orac — на примерку прямо на объект", "Ланчи для дизайнеров — каждую среду в 14:00", "Доставка по Ростову — Яндекс Go, по России — транспортными компаниями"];
  window.MDB_TOP = '<div class="ann"><button class="ann-arr" data-ann="-1" aria-label="Назад">‹</button><span id="ann-txt">' + t(ann[0]) + '</span><button class="ann-arr" data-ann="1" aria-label="Вперёд">›</button></div>';

  /* Мега-меню */
  var mm = {
    shop: '<div class="mm-grid"><div class="mm-tile" style="background:linear-gradient(160deg,#8FA582,#5B7650)"><span>Новинка 2026</span><b>Гибкий камень Flex Stone</b><a href="item.html?id=flexstone">Смотреть</a></div>' +
      D.sections.map(function (s) {
        return '<div><a class="mm-h" href="catalog.html?sec=' + s.id + '">' + esc(s.name) + "</a>" + D.items.filter(function (i) { return i.sec === s.id; }).map(function (i) { return '<a href="item.html?id=' + i.id + '">' + t(i.name) + "</a>"; }).join("") + "</div>";
      }).join("") + "</div>",
    rooms: '<div class="mm-rooms">' + D.rooms.map(function (r) { return '<a href="room.html?id=' + r.id + '"><span style="background:' + r.tone + '"></span>' + esc(r.name) + "</a>"; }).join("") + "</div>",
    insp: '<div class="mm-grid three"><div><span class="mm-h">Советы</span>' + D.articles.map(function (a) { return '<a href="article.html?id=' + a.id + '">' + t(a.title) + "</a>"; }).join("") + '</div><div><span class="mm-h">Проекты</span><a href="index.html#projects">Интерьеры с нашими материалами</a><a href="index.html#projects">Конкурс «WOW стена»</a></div><div><span class="mm-h">Салон</span><a href="index.html#salon">Как добраться</a><a href="article.html?id=tryon">Образцы на объект</a><a href="index.html#dostavka">Доставка и оплата</a></div></div>',
    pro: '<div class="mm-grid three"><div><span class="mm-h">Дизайнерам</span><a href="index.html#pro">Ланчи по средам</a><a href="index.html#pro">Семинары в салоне</a><a href="index.html#pro">Условия сотрудничества</a></div><div><span class="mm-h">Строителям</span><a href="index.html#pro">Складская программа</a><a href="index.html#pro">Хранение оплаченных заказов</a></div><div><span class="mm-h">Компаниям</span><a href="room.html?id=commerce">Материалы для коммерции</a><a href="index.html#pro">Счёт для юрлица</a></div></div>'
  };
  window.MDB_HDR = '<header class="site b"><div class="wrap">' +
    '<nav class="main b-nav"><a href="catalog.html" data-mm="shop">Каталог</a><a href="#" data-mm="rooms">Комнаты</a><a href="#" data-mm="insp">Вдохновение</a><a href="#" data-mm="pro">Профессионалам</a></nav>' +
    '<a class="logo b-logo" href="index.html"><span><small>интерьерный салон</small><b>МАРТдекор</b></span></a>' +
    '<div class="hdr-actions"><a class="ico" href="catalog.html" aria-label="Поиск"><i class="ti ti-search"></i></a><button class="pick-btn" id="pick-open"><i class="ti ti-bookmark"></i>Подборка <span class="cnt" id="pick-cnt">0</span></button></div></div>' +
    '<div class="mm" id="mm"><div class="wrap" id="mm-in"></div></div></header>';

  window.MDB_INIT = function () {
    var card = window.MDcard;
    /* бегущая строка */
    var k = 0, el = document.getElementById("ann-txt");
    function show(d) { k = (k + d + ann.length) % ann.length; el.textContent = T(ann[k]); }
    document.querySelectorAll("[data-ann]").forEach(function (b) { b.addEventListener("click", function () { show(+b.getAttribute("data-ann")); }); });
    setInterval(function () { show(1); }, 5000);
    /* мега-меню */
    var box = document.getElementById("mm"), inner = document.getElementById("mm-in"), timer;
    document.querySelectorAll("[data-mm]").forEach(function (a) {
      a.addEventListener("mouseenter", function () { clearTimeout(timer); inner.innerHTML = mm[a.getAttribute("data-mm")]; box.classList.add("on"); });
      a.addEventListener("click", function (e) { if (a.getAttribute("href") === "#") e.preventDefault(); });
    });
    document.querySelector("header.site").addEventListener("mouseleave", function () { timer = setTimeout(function () { box.classList.remove("on"); }, 150); });
    /* «Вам может понравиться» в подборке */
    var also = document.getElementById("pick-also");
    if (also) also.innerHTML = '<span class="mm-h">Вам может понравиться</span>' + ["flexstone", "orac", "fan"].map(function (id) {
      var i = D.items.filter(function (x) { return x.id === id; })[0];
      return '<a href="item.html?id=' + i.id + '"><span style="background:' + window.MDtone[i.sec] + '"></span>' + t(i.name) + "</a>";
    }).join("");

    function carousel(sel, ids) {
      var c = document.querySelector(sel); if (!c) return;
      c.innerHTML = ids.map(function (id) { return card(D.items.filter(function (x) { return x.id === id; })[0]); }).join("");
    }
    document.querySelectorAll("[data-scroll]").forEach(function (b) {
      b.addEventListener("click", function () { var c = document.querySelector(b.getAttribute("data-target")); c.scrollBy({ left: +b.getAttribute("data-scroll") * c.clientWidth * 0.8, behavior: "smooth" }); });
    });

    if (page === "home") {
      /* слайдер */
      var slides = document.querySelectorAll(".slide"), dots = document.getElementById("dots"), cur = 0;
      dots.innerHTML = Array.prototype.map.call(slides, function (_, n) { return '<button aria-label="Слайд ' + (n + 1) + '"></button>'; }).join("");
      function go(n) { cur = (n + slides.length) % slides.length; slides.forEach(function (s, j) { s.classList.toggle("on", j === cur); }); dots.querySelectorAll("button").forEach(function (d, j) { d.classList.toggle("on", j === cur); }); }
      dots.querySelectorAll("button").forEach(function (d, j) { d.addEventListener("click", function () { go(j); }); });
      document.getElementById("prev").addEventListener("click", function () { go(cur - 1); });
      document.getElementById("next").addEventListener("click", function () { go(cur + 1); });
      go(0); setInterval(function () { go(cur + 1); }, 7000);
      /* разделы */
      document.getElementById("cats").innerHTML = D.sections.map(function (s) { return '<a class="cat rv" href="catalog.html?sec=' + s.id + '"><span class="img" style="background:' + window.MDtone[s.id] + '"></span><b>' + t(s.name) + "</b><small>" + (s.from ? "от " + esc(s.from) : "цены по запросу") + "</small></a>"; }).join("");
      carousel("#car-new", ["flexstone", "hikari", "bamboo", "acoustic", "ripple"]);
      carousel("#car-wall", ["tropic", "film600", "shangrila", "basalt", "seamless", "kids"]);
      carousel("#car-com", ["flexstone", "ripple", "dblack", "tropic", "acoustic"]);
      document.getElementById("rooms").innerHTML = D.rooms.map(function (r) { return '<a class="room rv" href="room.html?id=' + r.id + '"><span class="img" style="background:' + r.tone + '"><span class="ph-note">' + t("Фото: " + r.name.toLowerCase() + " с материалами салона") + "</span></span><b>" + esc(r.name) + '</b><small>Смотреть материалы →</small></a>'; }).join("");
      document.getElementById("pro-cards").innerHTML = D.designers.map(function (p) { return '<div class="pro-card rv"><h3>' + t(p.t) + "</h3><p>" + t(p.d) + '</p><span class="src">' + t(p.src) + "</span></div>"; }).join("");
    }

    if (page === "room") {
      var r = D.rooms.filter(function (x) { return x.id === new URLSearchParams(location.search).get("id"); })[0] || D.rooms[0];
      document.title = r.name + " — МАРТдекор";
      document.getElementById("room-hero").innerHTML = '<div class="room-hero" style="background:' + r.tone + '"><div><span class="eyebrow">Комнаты</span><h1>' + esc(r.name) + '</h1><p>' + t(r.lead) + '</p><span class="src" style="color:#E8DDD4">' + t("Из поста клиента: " + r.src) + '</span></div><span class="ph-note">' + t("Фото: " + r.name.toLowerCase() + " с материалами салона") + "</span></div>";
      var list = D.items.filter(function (i) { return i.room.indexOf(r.key) >= 0; });
      document.getElementById("car-room").innerHTML = list.map(card).join("");
      document.getElementById("room-count").textContent = list.length + " " + (list.length % 10 === 1 && list.length !== 11 ? "материал" : (list.length % 10 >= 2 && list.length % 10 <= 4 && (list.length < 12 || list.length > 14) ? "материала" : "материалов")) + " из выборки";
      var secs = D.sections.filter(function (s) { return list.some(function (i) { return i.sec === s.id; }); });
      document.getElementById("room-cats").innerHTML = secs.map(function (s) { return '<a class="cat rv" href="catalog.html?sec=' + s.id + '"><span class="img" style="background:' + window.MDtone[s.id] + '"></span><b>' + t(s.name) + "</b><small>Смотреть →</small></a>"; }).join("");
      document.getElementById("other-rooms").innerHTML = D.rooms.filter(function (x) { return x.id !== r.id; }).map(function (x) { return '<a class="room rv" href="room.html?id=' + x.id + '"><span class="img" style="background:' + x.tone + '"></span><b>' + esc(x.name) + "</b></a>"; }).join("");
    }
    window.MDrenderPick(); window.MDreveal();
  };
})();
