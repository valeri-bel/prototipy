/* Выборка из каталога gesundfood.pro, собрано 09.11.2026.
   Названия, цены, составы — дословно с карточек сайта, источник в поле src.
   Белок и калории — из карточки Wildberries 147784240 (ассорти, 9 пакетиков). */
var BASE = 'https://gesundfood.pro/nashi-kashi/';
var NUTRITION = { protein100: 36, kcal100: 355, portion: 55 };

var GROUPS = {
  mono:    { name: 'Моновкусы',       lead: 'Одна крупа, один вкус. 9 порций в боксе.' },
  assorti: { name: 'Ассорти-боксы',   lead: 'Разные крупы и вкусы в одной коробке.' },
  kit:     { name: 'Наборы на пробу', lead: 'Три пакетика, чтобы найти свой вкус.' },
  cup:     { name: 'Каши в стакане',  lead: 'Шесть стаканов, удобно взять с собой.' }
};

var CEREALS = [
  { id: 'oat',   name: 'Овсяная' },
  { id: 'rice',  name: 'Рисовая' },
  { id: 'buck',  name: 'Гречневая' },
  { id: 'millet',name: 'Пшённая' },
  { id: 'corn',  name: 'Кукурузная' }
];

var BASEMIX = 'концентрат молочного белка, концентрат сывороточного белка, соль, подсластитель (сукралоза)';

var PRODUCTS = [
  { id: 'ovs-klass', group: 'mono', cereals: ['oat'], name: 'Овсяная — Классическая', short: 'Овсяная', flavor: 'Классическая',
    pack: 'Дой-пак с зип-локом, 9 порций по 55 г', n: 9, weight: 495, price: 1150, color: 'oat',
    composition: 'Овсяные хлопья, ' + BASEMIX, src: 'mono/ovsyanaya-klassicheskaya.html' },
  { id: 'ovs-kokos', group: 'mono', cereals: ['oat'], name: 'Овсяная — Нежный кокос', short: 'Овсяная', flavor: 'Нежный кокос',
    pack: 'Дой-пак с зип-локом, 9 порций по 55 г', n: 9, weight: 495, price: 1150, color: 'oat', ask: 'Состав вкусовой добавки',
    composition: 'Овсяные хлопья, ' + BASEMIX, src: 'mono/ovsyanaya-nezhnyj-kokos.html' },
  { id: 'grech', group: 'mono', cereals: ['buck'], name: 'Гречневая — Классическая', short: 'Гречневая', flavor: 'Классическая',
    pack: '9 пакетиков по 55 г', n: 9, weight: 495, price: 1250, color: 'buck', hit: true,
    composition: 'Гречневые хлопья, ' + BASEMIX, src: 'mono/grechnevaya-klassicheskaya.html' },
  { id: 'ris-klass', group: 'mono', cereals: ['rice'], name: 'Рисовая — Классическая', short: 'Рисовая', flavor: 'Классическая',
    pack: 'Дой-пак с зип-локом, 9 порций по 55 г', n: 9, weight: 495, price: 1150, color: 'rice', hit: true,
    composition: 'Рисовые хлопья, ' + BASEMIX, src: 'mono/risovaya-klassicheskaya.html' },
  { id: 'kukur', group: 'mono', cereals: ['corn'], name: 'Кукурузная — Классическая', short: 'Кукурузная', flavor: 'Классическая',
    pack: 'Дой-пак с зип-локом, 9 порций по 55 г', n: 9, weight: 495, price: 1150, color: 'corn',
    composition: 'Кукурузные хлопья, ' + BASEMIX, src: 'mono/kukuruznaya-klassicheskaya.html' },

  { id: 'shtrudel', group: 'mono', cereals: ['oat'], name: 'Овсяная — Яблочный штрудель', short: 'Овсяная', flavor: 'Яблочный штрудель',
    pack: '9 пакетиков по 55 г', n: 9, weight: 495, price: 1250, color: 'berry', hit: true, ask: 'Состав вкусовой добавки',
    composition: 'Овсяные хлопья, ' + BASEMIX, src: 'mono/ovsyanaya-yablochnyj-shtrudel.html' },

  { id: 'boks', group: 'assorti', cereals: ['oat','rice','millet','buck','corn'], name: 'Ассорти: пять круп', short: 'Ассорти', flavor: 'Пять круп',
    pack: '9 пакетиков по 55 г', n: 9, weight: 495, price: 1250, color: 'mix', hit: true, ask: 'Как упакован бокс: на сайте указан дой-пак, а цена как у 9 пакетиков',
    composition: 'Овсяные хлопья; рисовые хлопья; пшенные хлопья; гречневые хлопья; кукурузные хлопья, ' + BASEMIX, src: 'assorty/boks-assorti.html' },
  { id: 'boks-bez', group: 'assorti', cereals: ['rice','buck','millet','corn'], noOat: true, name: 'Ассорти без овсянки', short: 'Без овсянки', flavor: 'Четыре крупы',
    pack: '9 пакетиков по 55 г', n: 9, weight: 495, price: 1250, color: 'rice',
    composition: 'Рисовые хлопья; гречневые хлопья; пшенные хлопья; кукурузные хлопья; ' + BASEMIX, src: 'assorty/boks-assorti-bez-ovsyanki.html' },
  { id: 'polnoe', group: 'assorti', cereals: ['oat','rice','millet','buck','corn'], name: 'Полное ассорти', short: 'Полное ассорти', flavor: 'Вся линейка',
    pack: '9 пакетиков по 55 г', n: 9, weight: 495, price: 1600, color: 'mix', gift: 'В подарок порционный пакет протеинового картофельного пюре',
    composition: 'Овсяные хлопья; рисовые хлопья; пшенные хлопья; гречневые хлопья; кукурузные хлопья; ' + BASEMIX, src: 'assorty/proteinovaya-kasha-polnoe-assorti1.html' },

  { id: 'kit-mix', group: 'kit', cereals: ['oat','rice','millet'], name: 'MIX ассорти', short: 'MIX', flavor: 'Кокос, ананас, яблоко',
    pack: '3 пакетика по 55 г', n: 3, weight: 165, price: 450, color: 'corn',
    composition: 'Овсяные хлопья; рисовые хлопья; пшенные хлопья; ' + BASEMIX + '; мякоть кокоса; ананас; яблоко сушеное; корица', src: 'assorty/proteinovaya-kasha-mix-assorti-v-paketikah.html' },
  { id: 'kit-yagod', group: 'kit', cereals: ['oat'], name: 'Ягодное ассорти', short: 'Ягодное', flavor: 'Смородина, вишня, клубника',
    pack: '3 пакетика по 55 г', n: 3, weight: 165, price: 450, color: 'berry',
    composition: 'Овсяные хлопья; ' + BASEMIX + '; черная смородина; вишня; клубника', src: 'assorty/proteinovaya-kasha-yagodnoe-assorti.html' },
  { id: 'kit-klass', group: 'kit', cereals: ['oat','buck','rice'], name: 'Классические вкусы', short: 'Классика', flavor: 'Овсяная, гречневая, рисовая',
    pack: '3 пакетика по 55 г', n: 3, weight: 165, price: 450, color: 'oat',
    composition: 'Овсяные хлопья, гречневые хлопья, рисовые хлопья, ' + BASEMIX, src: 'assorty/proteinovaya-kasha-klassichskie-vkusy.html' },

  { id: 'cup-ovs', group: 'cup', cereals: ['oat'], name: 'Овсяное ассорти в стакане', short: 'Овсяное', flavor: 'Шесть стаканов',
    pack: '6 стаканов по 55 г', n: 6, weight: 330, price: 1195, color: 'oat', cup: true,
    composition: 'Овсяные хлопья; ' + BASEMIX, src: 'assorty/proteinovaya-kasha-ovsyanoe-assorti-v-stakane.html' },
  { id: 'cup-bez', group: 'cup', cereals: ['rice','buck','millet','corn'], noOat: true, name: 'Ассорти без овсянки в стакане', short: 'Без овсянки', flavor: 'Шесть стаканов',
    pack: '6 стаканов по 55 г', n: 6, weight: 330, price: 1195, color: 'buck', cup: true,
    composition: 'Рисовые хлопья; гречневые хлопья; пшенные хлопья; кукурузные хлопья; ' + BASEMIX, src: 'assorty/proteinovaya-kasha-assorti-bez-ovsyanki-v-stakane1.html' }
];

/* Отзывы — дословно, Wildberries, карточка 257017375, собрано 09.11.2026 */
var REVIEWS = [
  { name: 'Евгения', date: '26 сентября', pack: '12 пакетиков', text: 'Восторг! Вкусы, оформление, разнообразие. И масса 55 г, это больше чем у других производителей (40 г. обычно).' },
  { name: 'Елена', date: '22 сентября', pack: '9 пакетиков', text: 'Взяла бокс с разными вкусами — и не пожалела! Смородина вкусная, ягода прям целиковая, а маршмеллоу в подарок делают любую кашу десертом. Пробую разные — не надоедает. Рекомендую!' },
  { name: 'Елена', date: '7 июля', pack: '12 пакетиков', text: 'Каши очень вкусные и сытные, мне хватает этого завтрака на весь день.' },
  { name: 'Валерия', date: '29 сентября', pack: '9 пакетиков', text: 'Идеальный завтрак, обожаю молочный оттенок в этих кашах.' }
];

var FAQ = [
  { q: 'Сколько воды нужно и как готовить?', a: 'Высыпать содержимое пакетика (55 г) в ёмкость, добавить 150 мл горячей воды, хорошо перемешать, накрыть крышкой и дать постоять 5 минут.' },
  { q: 'Насколько каша сладкая?', a: 'Сахара в составе нет, подсластитель — сукралоза. Покупатели на Wildberries оценивают по-разному: одни пишут «чуть сладкая», другие «сладковаты». Если любите менее сладкое, начните с набора из трёх пакетиков.' },
  { q: 'С чего начать, если не пробовали?', a: 'С набора на три пакетика разных вкусов за 450 ₽. Понравившуюся кашу потом можно взять в боксе на 495 г.' },
  { q: 'Есть каши без овсянки?', a: 'Есть: бокс из 9 пакетиков и 6 стаканов на рисовых, гречневых, пшённых и кукурузных хлопьях.' },
  { q: 'Как открытая упаковка хранится?', a: 'В боксах с дой-паком есть зип-лок, пакет удобно закрывать после вскрытия. Если нужно брать с собой, выбирайте формат с порционными пакетиками.' },
  { q: 'Как оформить и получить заказ?', a: 'После оформления с вами свяжется менеджер и предложит условия оплаты и способы доставки. Каши также продаются на Wildberries и Ozon.' }
];

var SHOPS = {
  wb: 'https://www.wildberries.ru/seller/1171054',
  ozon: 'https://www.ozon.ru/seller/kachestvennye-produkty-1004046/produkty-pitaniya-9200/?miniapp=seller_1004046'
};
