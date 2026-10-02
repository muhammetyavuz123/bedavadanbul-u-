// Türkçe karakterleri sadeleştirip URL dostu bir slug üretir.
// (api/utils/slug.js ile birebir aynı mantık olmalı.)
const MAP = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

export const slugify = (value = "") =>
  String(value)
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (c) => MAP[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const cityPath = (city) => `/isletmeler/${slugify(city)}`;
export const districtPath = (city, district) =>
  `/isletmeler/${slugify(city)}/${slugify(district)}`;
