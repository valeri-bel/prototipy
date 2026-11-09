(function () {
  var T = window.typo || function (s) { return s; };
  var page = document.body.getAttribute('data-page');
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  var perPortion = function (p) { return Math.round(p.price / p.n); };
  var plural = function (n) { var a = n % 100, b = n % 10; if (a > 10 && a < 20) return 'порций'; if (b === 1) return 'порция'; if (b > 1 && b < 5) return 'порции'; return 'порций'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* корзина */
  var KEY = 'mytime-cart';
  var mem = {};
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return mem; } }
  function write(c) { mem = c; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} badge(); }
  function count() { var c = read(), s = 0; for (var k in c) s += c[k]; return s; }
  function add(id, q) { var c = read(); c[id] = (c[id] || 0) + (q || 1); write(c); toast('Добавили в корзину'); }
  function badge() { var b = document.getElementById('cart-count'); if (b) { var n = count(); b.textContent = n; b.hidden = !n; } }
  function toast(t) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 1800);
  }

  /* шапка и подвал */
  var nav = [['catalog.html', 'Каталог'], ['index.html#how', 'Как готовить'], ['index.html#reviews', 'Отзывы'], ['index.html#buy', 'Доставка и где купить'], ['index.html#faq', 'Вопросы']];
  document.getElementById('site-header').innerHTML =
    '<div class="wrap head"><a class="logo" href="index.html" aria-label="My Time, на главную"><img src="img/logo.svg" alt="My Time"></a>' +
    '<nav class="nav" id="nav">' + nav.map(function (n) { return '<a href="' + n[0] + '">' + T(n[1]) + '</a>'; }).join('') + '</nav>' +
    '<a class="tel" href="tel:88005505835">8 800 550-58-35</a>' +
    '<a class="cart-link" href="cart.html" aria-label="Корзина"><i class="ti ti-shopping-bag"></i><span id="cart-count" class="count" hidden>0</span></a>' +
    '<button class="burger" id="burger" aria-label="Меню"><i class="ti ti-menu-2"></i></button></div>';
  document.getElementById('burger').addEventListener('click', function () { document.getElementById('nav').classList.toggle('open'); });

  document.getElementById('site-footer').innerHTML =
    '<div class="wrap foot"><div><img src="img/logo.svg" alt="My Time" class="foot-logo"><p>' + T('Протеиновые каши без сахара, сои, красителей и консервантов.') + '</p></div>' +
    '<div><h4>Каталог</h4>' + Object.keys(GROUPS).map(function (g) { return '<a href="catalog.html?group=' + g + '">' + T(GROUPS[g].name) + '</a>'; }).join('') + '</div>' +
    '<div><h4>Контакты</h4><a href="tel:88005505835">8 800 550-58-35</a><a href="mailto:info@gesundfood.pro">info@gesundfood.pro</a><span>' + T('Нижегородская область, пос. Решетиха, ул. Затылкова') + '</span><span>' + T('Пн–пт с 9:00 до 17:00') + '</span></div>' +
    '<div><h4>Маркетплейсы</h4><a href="' + SHOPS.wb + '" target="_blank" rel="noopener">Wildberries</a><a href="' + SHOPS.ozon + '" target="_blank" rel="noopener">Ozon</a></div></div>' +
    '<div class="wrap proto">' + T('Прототип сайта. Формы ничего не отправляют, оплата не подключена, фото упаковок — заглушки. Подготовила Валерия Белецкая.') + '</div>';
  badge();

  /* карточка товара */
  function packArt(p) {
    return '<div class="pack pack-' + p.color + (p.cup ? ' is-cup' : '') + '">' +
      '<span class="pack-brand">My Time</span>' +
      '<span class="pack-name">' + T(p.short) + '</span>' +
      '<span class="pack-flavor">' + T(p.flavor) + '</span>' +
      '<span class="pack-band">36 г белка<br>на 100 г</span></div>';
  }
  function card(p) {
    return '<article class="card">' +
      '<a class="card-art" href="item.html?id=' + p.id + '">' + packArt(p) + (p.hit ? '<span class="flag">Хит</span>' : '') + '</a>' +
      '<div class="card-body"><span class="card-pack">' + T(p.pack) + '</span>' +
      '<h3><a href="item.html?id=' + p.id + '">' + T(p.name) + '</a></h3>' +
      '<div class="card-buy"><div><b>' + fmt(p.price) + '</b><small>' + fmt(perPortion(p)) + ' за порцию</small></div>' +
      '<button class="btn-add" data-add="' + p.id + '" aria-label="В корзину"><i class="ti ti-plus"></i></button></div></div></article>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b) { e.preventDefault(); add(b.getAttribute('data-add')); }
  });
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  /* главная */
  if (page === 'home') {
    document.getElementById('groups').innerHTML = Object.keys(GROUPS).map(function (g) {
      var list = PRODUCTS.filter(function (p) { return p.group === g; });
      var min = Math.min.apply(null, list.map(function (p) { return p.price; }));
      return '<a class="group group-' + g + '" href="catalog.html?group=' + g + '"><h3>' + T(GROUPS[g].name) + '</h3><p>' + T(GROUPS[g].lead) + '</p><span>от ' + fmt(min) + ' <i class="ti ti-arrow-right"></i></span></a>';
    }).join('');
    document.getElementById('picker').innerHTML = CEREALS.map(function (c) {
      return '<a class="chip" href="catalog.html?cereal=' + c.id + '">' + T(c.name) + '</a>';
    }).join('') + '<a class="chip chip-alt" href="catalog.html?nooat=1">Без овсянки</a>';
    document.getElementById('hits').innerHTML = PRODUCTS.filter(function (p) { return p.hit; }).map(card).join('');
    document.getElementById('reviews-list').innerHTML = REVIEWS.map(function (r) {
      return '<figure class="review"><blockquote>' + T(r.text) + '</blockquote><figcaption><b>' + esc(r.name) + '</b><span>' + T(r.date + ', набор: ' + r.pack) + '</span></figcaption></figure>';
    }).join('');
    document.getElementById('faq-list').innerHTML = FAQ.map(function (f) {
      return '<details class="faq"><summary>' + T(f.q) + '<i class="ti ti-plus"></i></summary><p>' + T(f.a) + '</p></details>';
    }).join('');
  }

  /* каталог */
  if (page === 'catalog') {
    var q = new URLSearchParams(location.search);
    var state = { group: q.get('group') || '', cereal: q.get('cereal') || '', noOat: q.get('nooat') === '1', sort: 'pop', s: '' };
    var grid = document.getElementById('grid');
    var result = document.getElementById('result');
    function chips(id, items, key) {
      var el = document.getElementById(id);
      el.innerHTML = '<button class="chip" data-v="">Все</button>' + items.map(function (i) { return '<button class="chip" data-v="' + i[0] + '">' + T(i[1]) + '</button>'; }).join('');
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        state[key] = b.getAttribute('data-v'); render();
      });
    }
    chips('f-group', Object.keys(GROUPS).map(function (g) { return [g, GROUPS[g].name]; }), 'group');
    chips('f-cereal', CEREALS.map(function (c) { return [c.id, c.name]; }), 'cereal');
    var noOatBox = document.getElementById('f-nooat');
    var search = document.getElementById('f-search');
    var sort = document.getElementById('f-sort');
    noOatBox.addEventListener('change', function () { state.noOat = noOatBox.checked; render(); });
    search.addEventListener('input', function () { state.s = search.value.trim().toLowerCase(); render(); });
    sort.addEventListener('change', function () { state.sort = sort.value; render(); });
    document.getElementById('reset').addEventListener('click', function () {
      state = { group: '', cereal: '', noOat: false, sort: 'pop', s: '' }; search.value = ''; sort.value = 'pop'; render();
    });
    function render() {
      noOatBox.checked = state.noOat;
      [['f-group', state.group], ['f-cereal', state.cereal]].forEach(function (x) {
        document.querySelectorAll('#' + x[0] + ' .chip').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === x[1]); });
      });
      var list = PRODUCTS.filter(function (p) {
        if (state.group && p.group !== state.group) return false;
        if (state.cereal && p.cereals.indexOf(state.cereal) < 0) return false;
        if (state.noOat && p.cereals.indexOf('oat') >= 0) return false;
        if (state.s && (p.name + ' ' + p.flavor + ' ' + p.composition).toLowerCase().indexOf(state.s) < 0) return false;
        return true;
      });
      if (state.sort === 'portion') list = list.slice().sort(function (a, b) { return perPortion(a) - perPortion(b); });
      if (state.sort === 'price') list = list.slice().sort(function (a, b) { return a.price - b.price; });
      grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty">' + T('По таким условиям каш нет. Попробуйте убрать один из фильтров.') + '</div>';
      result.textContent = list.length + ' из ' + PRODUCTS.length;
    }
    render();
  }

  /* карточка */
  if (page === 'item') {
    var id = new URLSearchParams(location.search).get('id');
    var p = byId(id) || PRODUCTS[0];
    document.title = p.name + ' — My Time';
    var protein = Math.round(NUTRITION.protein100 * NUTRITION.portion / 100);
    var kcal = Math.round(NUTRITION.kcal100 * NUTRITION.portion / 100);
    var same = PRODUCTS.filter(function (x) { return x.group === p.group && x.id !== p.id; }).slice(0, 4);
    document.getElementById('item').innerHTML =
      '<nav class="crumbs"><a href="catalog.html">Каталог</a><span>/</span><a href="catalog.html?group=' + p.group + '">' + T(GROUPS[p.group].name) + '</a></nav>' +
      '<div class="item"><div class="item-art">' + packArt(p) + '<div class="need">' + T('Нужно от вас: фото упаковки и каши в тарелке') + '</div></div>' +
      '<div class="item-info"><span class="card-pack">' + T(p.pack + ', ' + p.weight + ' г') + '</span><h1>' + T(p.name) + '</h1>' +
      '<div class="item-price"><b>' + fmt(p.price) + '</b><span>' + fmt(perPortion(p)) + ' за порцию 55 г</span></div>' +
      (p.gift ? '<p class="gift"><i class="ti ti-gift"></i>' + T(p.gift) + '</p>' : '') +
      '<div class="item-buy"><div class="qty"><button id="minus" aria-label="Меньше">−</button><span id="qty">1</span><button id="plus" aria-label="Больше">+</button></div><button class="btn" id="buy">В корзину</button></div>' +
      '<div class="label"><div class="label-head">В одной порции 55 г</div>' +
      '<div class="label-row big"><span>Белок</span><b>≈' + protein + ' г</b></div>' +
      '<div class="label-row"><span>Энергетическая ценность</span><b>≈' + kcal + ' ккал</b></div>' +
      '<div class="label-row"><span>Сахар в составе</span><b>нет</b></div>' +
      '<div class="label-row"><span>Вода и время</span><b>150 мл, 5 мин</b></div>' +
      '<div class="label-note">' + T('36 г белка и 355 ккал на 100 г из карточки Wildberries. Нужно от вас: жиры, углеводы и значения по каждому вкусу.') + '</div></div>' +
      '<h2 class="sm">Состав</h2><p>' + T(p.composition) + '</p>' +
      (p.ask ? '<div class="need">' + T('Нужно от вас: ' + p.ask.toLowerCase()) + '</div>' : '') +
      '<p class="src">' + T('Данные с действующей карточки: ') + '<a href="' + BASE + p.src + '" target="_blank" rel="noopener">gesundfood.pro</a></p></div></div>' +
      (same.length ? '<section class="sect"><h2>Ещё в разделе «' + T(GROUPS[p.group].name) + '»</h2><div class="grid">' + same.map(card).join('') + '</div></section>' : '');
    var qty = 1, qEl = document.getElementById('qty');
    document.getElementById('minus').onclick = function () { qty = Math.max(1, qty - 1); qEl.textContent = qty; };
    document.getElementById('plus').onclick = function () { qty = Math.min(20, qty + 1); qEl.textContent = qty; };
    document.getElementById('buy').onclick = function () { add(p.id, qty); };
  }

  /* корзина */
  if (page === 'cart') {
    var box = document.getElementById('cart');
    var drawCart = function () {
      var c = read(), ids = Object.keys(c).filter(byId);
      if (!ids.length) {
        box.innerHTML = '<div class="empty big"><p>' + T('В корзине пока пусто') + '</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>';
        return;
      }
      var total = 0, portions = 0;
      var rows = ids.map(function (i) {
        var p = byId(i); total += p.price * c[i]; portions += p.n * c[i];
        return '<div class="row"><a class="row-art" href="item.html?id=' + p.id + '">' + packArt(p) + '</a><div class="row-info"><a href="item.html?id=' + p.id + '"><b>' + T(p.name) + '</b></a><span>' + T(p.pack) + '</span></div>' +
          '<div class="qty"><button data-dec="' + i + '" aria-label="Меньше">−</button><span>' + c[i] + '</span><button data-inc="' + i + '" aria-label="Больше">+</button></div>' +
          '<b class="row-sum">' + fmt(p.price * c[i]) + '</b><button class="row-del" data-del="' + i + '" aria-label="Удалить"><i class="ti ti-x"></i></button></div>';
      }).join('');
      box.innerHTML = '<div class="cart-grid"><div>' + rows + '</div>' +
        '<form class="order" id="order"><h2 class="sm">Оформление</h2>' +
        '<div class="order-sum"><span>' + portions + ' порций</span><b>' + fmt(total) + '</b></div>' +
        '<label>Имя<input required name="name" autocomplete="name"></label>' +
        '<label>Телефон<input required name="tel" type="tel" autocomplete="tel" placeholder="+7"></label>' +
        '<label>Город<input required name="city" autocomplete="address-level2"></label>' +
        '<div class="need">' + T('Нужно от вас: службы доставки, стоимость и сроки. Сейчас заказ подтверждает менеджер.') + '</div>' +
        '<label class="check"><input type="checkbox" required><span>' + T('Согласен на обработку персональных данных (нужен текст политики)') + '</span></label>' +
        '<button class="btn wide">Оформить заказ</button></form></div>';
      document.getElementById('order').addEventListener('submit', function (e) {
        e.preventDefault(); write({});
        box.innerHTML = '<div class="empty big"><i class="ti ti-circle-check"></i><h2>' + T('Спасибо, заказ принят') + '</h2><p>' + T('Менеджер свяжется с вами и предложит условия оплаты и доставки. Это демонстрация: заказ никуда не отправлен.') + '</p><a class="btn" href="catalog.html">Вернуться в каталог</a></div>';
      });
    };
    box.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      var c = read();
      if (t.dataset.inc) c[t.dataset.inc]++;
      else if (t.dataset.dec) { c[t.dataset.dec]--; if (c[t.dataset.dec] < 1) delete c[t.dataset.dec]; }
      else if (t.dataset.del) delete c[t.dataset.del];
      else return;
      write(c); drawCart();
    });
    drawCart();
  }
})();
