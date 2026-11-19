// Geçerli bir görsel adresi mi? ("null", "undefined", boş, http(s)/data/blob dışı değerleri eler)
const BAD = new Set(["", "null", "undefined", "0", "-", "false"]);

export function isRealImage(src) {
  if (src === null || src === undefined) return false;
  const s = String(typeof src === "object" ? src.url || "" : src).trim();
  if (BAD.has(s.toLowerCase())) return false;
  return /^(https?:\/\/|\/\/|data:image\/|blob:|\/)/i.test(s);
}

// Bir dizideki geçerli görselleri (string url olarak) döndürür.
export function realImages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((i) => (i && typeof i === "object" ? i.url : i))
    .filter(isRealImage);
}
