/* Выборка из профиля https://profi.ru/profile/BeletskiyGV3/ (сбор 09.11.2026).
   Названия альбомов, число фото, услуги и цены взяты из профиля. На сайте показана часть снимков. */
window.PRICES = [
  { id: "argon", name: "Аргонная сварка", price: 3000, unit: "услуга", plural: "услуг", tag: "Аргонная сварка" },
  { id: "pipe-ss", name: "Сварка труб из нержавеющей стали", price: 3000, unit: "стык", plural: "стыков", tag: "Сварка труб из нержавеющей стали" },
  { id: "pipe", name: "Сварка металлических труб", price: 2300, unit: "стык", plural: "стыков", tag: "Сварка металлических труб" },
  { id: "riser", name: "Сварка стояков", price: 2300, unit: "шт.", plural: "шт.", tag: "Сварка стояков" },
  { id: "struct", name: "Сварка металлоконструкций", price: 2500, unit: "услуга", plural: "услуг", tag: "Сварка металлоконструкций" },
  { id: "mig", name: "Сварка полуавтоматом", price: 2000, unit: "услуга", plural: "услуг", tag: "Сварка полуавтоматом" },
  { id: "mma", name: "Электрическая дуговая сварка", price: 1600, unit: "услуга", plural: "услуг", tag: "Электрод" },
  { id: "weld", name: "Сварка", price: 3000, unit: "услуга", plural: "услуг", tag: "Сварка" },
  { id: "learn", name: "Обучение сварке", price: 3000, unit: "услуга", plural: "услуг", tag: "Обучение сварке" }
];

var T = {
  a: "Аргонная сварка", w: "Сварка", p: "Сварка металлических труб", s: "Сварка труб из нержавеющей стали",
  m: "Металлоконструкции", k: "Сварка металлоконструкций", q: "Сварка полуавтоматом", l: "Обучение сварке"
};

window.ALBUMS = [
  { id: "flancy", name: "Фланцы", count: 16, cover: "056", process: ["argon", "ss"],
    tags: [T.a, T.l, T.p, T.s, T.w, T.k, "Монтаж фланцевых задвижек", T.m],
    photos: ["056", "054", "041", "040", "034", "057", "052", "047"] },
  { id: "obvyazka", name: "Обвязка ёмкостного оборудования", count: 19, cover: "135", process: ["argon", "ss"],
    tags: [T.w, T.a, T.p, T.s, T.k],
    photos: ["135", "125", "124", "132", "136", "138", "144", "145"] },
  { id: "flex", name: "Flex", note: "гибкие рукава в оплётке", count: 23, cover: "033", process: ["argon", "ss"],
    tags: [T.w, T.a, T.s, T.p, T.m],
    photos: ["033", "038", "010", "019", "011", "024", "027", "032"] },
  { id: "kompensatory", name: "Компенсаторы", count: 5, cover: "120", process: ["argon"],
    tags: [T.m, T.a, "Ремонт труб"],
    photos: ["120", "121", "123", "004"] },
  { id: "tonkiy", name: "Тонкостенный металл 0,5⁠–⁠2 мм", count: 19, cover: "065", process: ["argon", "ss"],
    tags: [T.m, T.w, T.a, T.p, T.s, T.l],
    photos: ["065", "066", "073", "061", "063", "070", "075", "059"] },
  { id: "seriya", name: "Серийное производство", count: 11, cover: "088", process: ["argon", "mig", "ss"],
    tags: [T.p, T.q, T.m, T.w, T.a, T.s],
    photos: ["088", "086", "090", "092", "093", "109"] },
  { id: "konstrukcii", name: "Конструкции", count: 9, cover: "115", process: ["argon"],
    tags: [T.m, T.w, T.a, T.p, T.k],
    photos: ["115", "116", "118", "119", "111", "112"] },
  { id: "remont", name: "Ремонт", count: 13, cover: "139", process: ["argon", "ss"],
    tags: [T.w, T.a, T.p, T.s, T.m],
    photos: ["139", "097", "099", "102", "105"] },
  { id: "gidravlika", name: "Гидравлические трубы", count: 4, cover: "150", process: ["argon"],
    tags: [T.w, T.a],
    photos: ["150", "149", "152", "154"] },
  { id: "chernyy", name: "Чёрный металл", count: 10, cover: "043", process: ["argon", "ss"],
    tags: ["Отопление", T.w, "Монтаж вентиляционных установок", T.p, "Сварка стояков", T.a, T.m, "Ремонт труб", T.s],
    photos: ["043", "042", "044", "001"] },
  { id: "elektrod", name: "Электрод", count: 16, cover: "164", process: ["mma"],
    tags: ["Отопление", T.w, "Монтаж вентиляционных установок", T.p, "Сварка стояков"],
    photos: ["164", "163", "161", "172", "158", "159"] },
  { id: "poluavtomat", name: "Полуавтомат", count: 3, cover: "108", process: ["mig"],
    tags: [T.p, T.q],
    photos: ["108", "109", "110"] }
];

window.PROCESS = [
  { id: "all", name: "Все работы" },
  { id: "argon", name: "Аргон" },
  { id: "ss", name: "Нержавейка" },
  { id: "mig", name: "Полуавтомат" },
  { id: "mma", name: "Электрод" }
];
