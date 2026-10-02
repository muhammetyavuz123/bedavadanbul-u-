// Logosu/fotoğrafı olmayan işletmeler için işletme adından türetilen sabit renk teması.
// Aynı ad her zaman aynı renkleri verir; böylece sayfa boş/soluk görünmez.
const PALETTES = [
  ["#ff3c38", "#ff8a5c"],
  ["#6a3df0", "#c04bd9"],
  ["#0f9d8a", "#37c6a0"],
  ["#2563eb", "#38bdf8"],
  ["#e0457b", "#ff8fab"],
  ["#e8890c", "#ef5a35"],
  ["#1c1f2e", "#5b45a8"],
];

const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export function getInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters =
    words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[1][0]}`;
  return letters.toLocaleUpperCase("tr-TR");
}

export function bizTheme(name = "") {
  const [from, to] = PALETTES[hash(String(name)) % PALETTES.length];
  return {
    from,
    to,
    gradient: `linear-gradient(135deg, ${from}, ${to})`,
    initials: getInitials(name),
  };
}
