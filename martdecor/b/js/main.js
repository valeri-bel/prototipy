(function () {
  var D = window.MD, T = window.typo || function (s) { return s; };
  var TONE = {
    gips: "linear-gradient(160deg,#D9D3C8,#A89A80)",
    panels: "linear-gradient(160deg,#8FA582,#5B7650)",
    stone: "linear-gradient(160deg,#6B5547,#2E2420)",
    walls: "linear-gradient(160deg,#7A3340,#45151D)",
    paint: "linear-gradient(160deg,#C9BCA6,#8E7F68)",
    decor: "linear-gradient(160deg,#CFD1CB,#9A9D96)"
  };
  var PH = {
    gips: "Фото: панно на стене при боковом свете",
    panels: "Фото: панель в интерьере, крупно фактура",
    stone: "Фото: лист шпона, видна прожилка",
    walls: "Фото: стена с обоями целиком",
    paint: "Фото: выкраски на стене салона",
    decor: "Фото: карниз в углу потолка"
  };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function sec(id) { return D.sections.filter(function (s) { return s.id === id; })[0]; }
  function item(id) { return D.items.filter(function (i) { return i.id === id; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function t(s) { return esc(T(s)); }

  /* Подборка: хранится только в этом браузере */
  var pick = [];
  try { pick = JSON.parse(localStorage.getItem("md-pick") || "[]"); } catch (e) { pick = []; }
  function savePick() { try { localStorage.setItem("md-pick", JSON.stringify(pick)); } catch (e) {} }

  /* Шапка и подвал */
  var page = document.body.getAttribute("data-page");
  var top = window.MDB_TOP || "";
  var hdr = window.MDB_HDR || "";
  var ftr = '<footer class="site"><div class="wrap"><div class="cols">' +
    '<div><b>МАРТдекор</b>Интерьерный салон в Ростове-на-Дону. Лепной декор, 3D-панели, обои, краски и камень от 90+ брендов.</div>' +
    '<div><b>Каталог</b>' + D.sections.map(function (s) { return '<a href="catalog.html?sec=' + s.id + '">' + esc(s.name) + "</a>"; }).join("") + "</div>" +
    '<div><b>Покупателям</b><a href="index.html#podbor">Подбор материалов</a><a href="index.html#dostavka">Доставка и оплата</a><a href="index.html#faq">Вопросы</a><a href="article.html?id=tryon">Образцы на объект</a></div>' +
    '<div><b>Салон</b>пр. Михаила Нагибина, 30Л<br>дизайн-центр WEST, цокольный этаж<br>пн–пт 10:00–19:00<br>сб–вс 10:00–17:00<br><a href="tel:+79094200420">+7 (909) 420-04-20</a><a href="mailto:info@martdecor.ru">info@martdecor.ru</a></div>' +
    '</div><div class="proto-note">Прототип сайта для обсуждения. Цены и описания — из группы ВКонтакте и сайтов МАРТдекор, у каждой позиции указан источник. Наличие показано для примера, формы ничего не отправляют, фото — заглушки. Подготовила Валерия Белецкая, ноябрь 2026.</div></div></footer>';
  var drawer = '<aside class="drawer" id="drawer" aria-label="Подборка"><header><h3>Ваша подборка</h3><button class="x" id="pick-close" aria-label="Закрыть">×</button></header>' +
    '<div class="list" id="pick-list"></div><div class="also" id="pick-also"></div>' +
    '<form id="pick-form"><b>Отправить менеджеру</b><span style="font-size:14px;color:var(--muted)">Посчитаем стоимость под вашу площадь и ответим, что есть на складе</span>' +
    '<input placeholder="Имя" required><input placeholder="Телефон" required type="tel">' +
    '<select><option>Ответить в WhatsApp</option><option>Ответить в Telegram</option><option>Позвонить</option></select>' +
    '<label class="chk"><input type="checkbox"> Я дизайнер или строитель</label>' +
    '<button class="btn" type="submit">Отправить подборку</button></form></aside><div class="drawer-bg" id="drawer-bg"></div><div class="toast" id="toast"></div>';
  document.body.insertAdjacentHTML("afterbegin", top + hdr);
  document.body.insertAdjacentHTML("beforeend", ftr + drawer);

  function toast(msg) { var el = $("#toast"); el.textContent = T(msg); el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove("on"); }, 2200); }
  function renderPick() {
    $("#pick-cnt").textContent = pick.length;
    var l = $("#pick-list");
    l.innerHTML = pick.length ? pick.map(function (id) {
      var i = item(id); if (!i) return "";
      return '<div class="row"><span class="sw" style="background:' + TONE[i.sec] + '"></span><span><b>' + t(i.name) + "</b><br>" + (i.price ? esc(i.price) + " " + esc(i.unit || "") : "цена по запросу") + '</span><button data-del="' + i.id + '" aria-label="Убрать">×</button></div>';
    }).join("") : '<div class="empty">' + t("Добавляйте материалы кнопкой «+» — менеджер посчитает подборку под вашу площадь") + "</div>";
    $$(".add").forEach(function (b) { var on = pick.indexOf(b.getAttribute("data-id")) >= 0; b.classList.toggle("on", on); b.innerHTML = on ? "✓" : "+"; });
    $$("[data-pick-label]").forEach(function (b) { var on = pick.indexOf(b.getAttribute("data-id")) >= 0; b.innerHTML = on ? '<i class="ti ti-check"></i>В подборке' : '<i class="ti ti-bookmark"></i>Добавить в подборку'; });
  }
  function toggle(id) {
    var k = pick.indexOf(id);
    if (k >= 0) pick.splice(k, 1); else { pick.push(id); toast("Добавлено в подборку"); }
    savePick(); renderPick();
  }
  function openDrawer(v) { $("#drawer").classList.toggle("open", v); $("#drawer-bg").classList.toggle("on", v); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-id].add, [data-pick-label]"); if (a) { e.preventDefault(); toggle(a.getAttribute("data-id")); return; }
    var d = e.target.closest("[data-del]"); if (d) { toggle(d.getAttribute("data-del")); return; }
    if (e.target.closest("#pick-open")) openDrawer(true);
    if (e.target.closest("#pick-close") || e.target.id === "drawer-bg") openDrawer(false);
  });
  $("#pick-form").addEventListener("submit", function (e) { e.preventDefault(); openDrawer(false); toast("Это прототип — в рабочей версии подборка уйдёт менеджеру"); });
  $$("form.demo").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); toast("Это прототип — форма ничего не отправляет"); }); });

  /* Открыто сейчас: пн–пт 10–19, сб–вс 10–17 */
  (function () {
    var n = new Date(), d = n.getDay(), h = n.getHours() + n.getMinutes() / 60, close = (d === 0 || d === 6) ? 17 : 19;
    var open = h >= 10 && h < close, el = $("#open-now"); if (!el) return;
    el.classList.toggle("closed", !open);
    el.lastChild.textContent = open ? "Открыто до " + close + ":00" : "Закрыто · откроемся в 10:00";
  })();

  /* Карточка позиции */
  function card(i) {
    var s = sec(i.sec);
    var price = i.price ? '<span class="price">' + esc(i.price) + (i.unit ? " <small>" + esc(i.unit) + "</small>" : "") + "</span>" : '<span class="price req">Цена по запросу</span>';
    return '<article class="item rv"><a class="pic" href="item.html?id=' + i.id + '" style="background:' + TONE[i.sec] + '">' +
      '<span class="badges">' + (window.MDB_BADGES ? window.MDB_BADGES(i) : "") + '<span class="status ' + (i.status === "few" ? "few" : "") + '"><i></i>' + (i.status === "few" ? "Под заказ" : "Есть в салоне") + "</span></span>" +
      '<span class="ph-note">' + t(PH[i.sec]) + "</span></a>" +
      '<div class="body"><span class="sec-name">' + esc(s.short) + '</span><h3><a href="item.html?id=' + i.id + '">' + t(i.name) + '</a></h3><p class="line">' + t(i.line) + "</p>" +
      '' + (window.MDB_SWATCH ? window.MDB_SWATCH(i) : "") + '<div class="foot">' + price + '<button class="add" data-id="' + i.id + '" aria-label="В подборку">+</button></div></div></article>';
  }

  /* Главная */
  if (page === "home" && $("#secs")) {
    $("#secs").innerHTML = D.sections.map(function (s) {
      return '<a class="sec-card rv" href="catalog.html?sec=' + s.id + '"><span class="mini-arch" style="background:' + TONE[s.id] + '"></span><span><h3>' + t(s.name) + "</h3><p>" + t(s.fact) + '</p><span class="from">' + (s.from ? "от " + esc(s.from) : "цены по запросу") + "</span></span></a>";
    }).join("");
    var show = ["tropic", "flexstone", "dblack", "seamless", "acoustic", "charmant", "orac", "kids"];
    $("#picks").innerHTML = show.map(function (id) { return card(item(id)); }).join("");
    $("#pro-cards").innerHTML = D.designers.map(function (p) { return '<div class="pro-card rv"><h3>' + t(p.t) + "</h3><p>" + t(p.d) + '</p><span class="src">' + t(p.src) + "</span></div>"; }).join("");
    $("#arts").innerHTML = D.articles.map(function (a) { return '<a class="art rv" href="article.html?id=' + a.id + '"><span class="eyebrow">Совет</span><h3>' + t(a.title) + "</h3><p>" + t(a.lead) + '</p><span class="more">Читать →</span></a>'; }).join("");
  }

  /* Каталог */
  if (page === "catalog") {
    var q = new URLSearchParams(location.search), st = { sec: q.get("sec") || "", room: "", style: "", text: "" };
    function chips(el, list, key) {
      el.innerHTML = '<button class="chip" data-v="">Все</button>' + list.map(function (v) { return '<button class="chip" data-v="' + esc(v.id || v) + '">' + esc(v.short || v) + "</button>"; }).join("");
      el.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; st[key] = b.getAttribute("data-v"); draw(); });
    }
    function uniq(k) { var o = []; D.items.forEach(function (i) { i[k].forEach(function (v) { if (o.indexOf(v) < 0) o.push(v); }); }); return o; }
    chips($("#f-sec"), D.sections, "sec"); chips($("#f-room"), uniq("room"), "room"); chips($("#f-style"), uniq("style"), "style");
    $("#q").addEventListener("input", function (e) { st.text = e.target.value.trim().toLowerCase(); draw(); });
    function draw() {
      var list = D.items.filter(function (i) {
        return (!st.sec || i.sec === st.sec) && (!st.room || i.room.indexOf(st.room) >= 0) && (!st.style || i.style.indexOf(st.style) >= 0) &&
          (!st.text || (i.name + " " + i.line).toLowerCase().indexOf(st.text) >= 0);
      });
      [["#f-sec", "sec"], ["#f-room", "room"], ["#f-style", "style"]].forEach(function (p) { $$(".chip", $(p[0])).forEach(function (c) { c.classList.toggle("on", c.getAttribute("data-v") === st[p[1]]); }); });
      $("#cat-title").textContent = st.sec ? sec(st.sec).name : "Все материалы";
      $("#count").textContent = "Показано " + list.length + " из выборки · в салоне 90+ брендов";
      $("#cat-grid").innerHTML = list.length ? list.map(card).join("") : '<div class="nores">' + t("Ничего не нашлось. Напишите менеджеру — найдём, даже если этого нет в каталоге") + "</div>";
      renderPick(); reveal();
    }
    draw();
  }

  /* Карточка */
  if (page === "item") {
    var i = item(new URLSearchParams(location.search).get("id")) || D.items[0], s = sec(i.sec);
    document.title = i.name + " — МАРТдекор";
    $("#crumbs").innerHTML = '<a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / <a href="catalog.html?sec=' + s.id + '">' + esc(s.name) + "</a>";
    $("#itm").innerHTML =
      '<div class="gallery"><div class="big" style="background:' + TONE[i.sec] + '"><span class="ph-note">' + t(PH[i.sec]) + "</span></div>" +
      '<div class="sm" style="background:' + TONE[i.sec] + ';opacity:.85"><span class="ph-note">' + t("Фактура крупно") + '</span></div><div class="sm" style="background:' + TONE[i.sec] + ';opacity:.7"><span class="ph-note">' + t("В интерьере клиента") + "</span></div></div>" +
      '<div><span class="eyebrow">' + esc(s.name) + "</span><h1 style=\"font-size:clamp(34px,4vw,52px)\">" + t(i.name) + '</h1><p class="lead">' + t(i.line) + "</p>" +
      '<div class="price-box">' + (i.price ? '<span class="price">' + esc(i.price) + " <small>" + esc(i.unit || "") + "</small></span>" : '<span class="price req" style="font-size:22px">Цена по запросу — посчитаем под вашу площадь</span>') +
      (i.price2 ? '<span style="color:var(--muted);font-size:14px">' + t(i.price2) + "</span>" : "") +
      '<span class="status ' + (i.status === "few" ? "few" : "") + '" style="position:static;width:max-content;background:var(--stone)"><i></i>' + (i.status === "few" ? "Под заказ, срок уточнит менеджер" : "Образец есть в салоне") + " · для примера</span>" +
      '<div class="actions"><button class="btn" data-pick-label data-id="' + i.id + '"></button><a class="btn ghost" href="https://wa.me/79094200420"><i class="ti ti-brand-whatsapp"></i>Спросить в WhatsApp</a></div></div>' +
      (i.specs.length ? '<h3>Характеристики</h3><table class="specs">' + i.specs.map(function (p) { return "<tr><td>" + t(p[0]) + "</td><td>" + t(p[1]) + "</td></tr>"; }).join("") + "</table>" : "") +
      (i.plus.length ? '<h3 style="margin-top:28px">Почему выбирают</h3><ul class="plus">' + i.plus.map(function (p) { return "<li>" + t(p) + "</li>"; }).join("") + "</ul>" : "") +
      (i.need ? '<div class="note-need"><b>Что учесть:</b> ' + t(i.need) + "</div>" : "") +
      '<p style="margin-top:22px"><b>Подходит:</b> ' + esc(i.room.join(", ")) + "</p>" +
      '<div class="need" style="margin-top:18px"><b>Нужно от вас</b>' + t("Фото этой позиции в салоне и в реализованных интерьерах, актуальная цена и наличие") + "</div>" +
      '<p class="srcline">Источник: ' + t(i.src) + "</p></div>";
    $("#same").innerHTML = D.items.filter(function (x) { return x.sec === i.sec && x.id !== i.id; }).concat(D.items.filter(function (x) { return x.sec !== i.sec; })).slice(0, 4).map(card).join("");
  }

  /* Статья */
  if (page === "article") {
    var a = D.articles.filter(function (x) { return x.id === new URLSearchParams(location.search).get("id"); })[0] || D.articles[0];
    document.title = a.title + " — МАРТдекор";
    $("#article").innerHTML = '<div class="crumbs"><a href="index.html">Главная</a> / Советы</div><span class="eyebrow" style="margin-top:20px">Совет салона</span><h1 style="font-size:clamp(34px,4.4vw,56px)">' + t(a.title) + '</h1><p class="lead">' + t(a.lead) + "</p>" +
      '<div class="cover" style="background:' + TONE.panels + '"><span class="ph-note" style="color:#fff">' + t("Фото из поста клиента") + "</span></div>" +
      a.body.map(function (p) { return "<p>" + t(p) + "</p>"; }).join("") +
      '<p class="srcline">Источник: ' + t(a.src) + '</p><div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap"><a class="btn" href="catalog.html">Смотреть материалы</a><a class="btn ghost" href="index.html#salon">Приехать в салон</a></div>';
  }

  /* Появление при прокрутке */
  function reveal() {
    if (!("IntersectionObserver" in window)) { $$(".rv").forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08 });
    $$(".rv:not(.in)").forEach(function (e) { io.observe(e); });
  }
  window.MDcard = card; window.MDtone = TONE; window.MDph = PH; window.MDreveal = reveal; window.MDrenderPick = renderPick;
  if (window.MDB_INIT) window.MDB_INIT();
  renderPick(); reveal();
})();
