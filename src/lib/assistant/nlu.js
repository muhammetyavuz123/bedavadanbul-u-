// BedavadanBul Asistan — "anlama" katmanı (v2).
// Yapay zekâ servisi KULLANMAZ: Türkçe metni sadeleştirip ilçe/il, kategori,
// istek kelimeleri (ucuz, bugün biten, yakınımda...), önceki sonuçlara
// gönderme ("ilkini göster", "bunun telefonu") ve işletme sorularını
// (saat, telefon, adres...) tanır. Küçük yazım hatalarını düzeltir.
// Saf TypeScript: ağ isteği yok, maliyeti sıfır, kolay test edilir.
// ---------- Türkçe sadeleştirme ----------
const MAP = {
  ç: "c",
  ğ: "g",
  ş: "s",
  ö: "o",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};
export function norm(input) {
  return String(input || "")
    .replace(/[İIı]/g, "i")
    .toLowerCase()
    .replace(/[çğşöüâîû]/g, (c) => MAP[c] || c)
    .replace(/[’'`´]/g, "") // Bayrampaşa'da -> bayrampasada
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const lowerTr = (s) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
// "Bayrampaşa" -> "Bayrampaşa'da", "Esenler" -> "Esenler'de"
const BACK = "aıouâ";
const FRONT = "eiöüî";
const HARD = "çfhkpsşt";
export function locative(name) {
  const s = String(name || "");
  const low = lowerTr(s);
  let vowel = "e";
  for (let i = low.length - 1; i >= 0; i -= 1) {
    const ch = low[i];
    if (BACK.includes(ch)) {
      vowel = "a";
      break;
    }
    if (FRONT.includes(ch)) {
      vowel = "e";
      break;
    }
  }
  const last = low[low.length - 1] || "";
  const d = HARD.includes(last) ? "t" : "d";
  return `${s}'${d}${vowel}`;
}
// ---------- Yazım hatası toleransı ----------
// Optimal string alignment mesafesi (ekleme, silme, değiştirme, komşu yer değiştirme)
function editDistance(a, b) {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const d = [];
  for (let i = 0; i <= al; i += 1) {
    d[i] = [i];
  }
  for (let j = 0; j <= bl; j += 1) d[0][j] = j;
  for (let i = 1; i <= al; i += 1) {
    for (let j = 1; j <= bl; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[al][bl];
}
// Kelime, hedefe 1 (uzun kelimelerde 2) harf farkla yakın mı? İlk harf aynı olmalı.
function nearWord(token, word) {
  if (word.length < 5 || token.length < 5 || token[0] !== word[0]) return false;
  const lim = word.length >= 9 ? 2 : 1;
  if (Math.abs(token.length - word.length) > lim + 2) return false;
  // "kafeler" gibi eklenmiş hâllerde de tutsun diye kelime boyunda önek de denenir
  return (
    editDistance(token, word) <= lim ||
    editDistance(token.slice(0, word.length), word) <= lim
  );
}
// ---------- Kategori grupları ----------
export const GROUPS = [
  {
    key: "kafe",
    label: "kafe",
    words: [
      "kafe",
      "kahve",
      "cafe",
      "coffee",
      "kahvalti",
      "pastane",
      "tatli",
      "cay",
      "brunch",
    ],
    terms: ["kafe", "kahve", "pastane"],
  },
  {
    key: "restoran",
    label: "restoran",
    words: [
      "restoran",
      "restaurant",
      "lokanta",
      "yemek",
      "kebap",
      "pide",
      "lahmacun",
      "corba",
      "balik",
      "doner",
      "pizza",
      "burger",
      "izgara",
      "ocakbasi",
    ],
    terms: ["restoran", "lokanta", "yemek"],
  },
  {
    key: "berber",
    label: "berber",
    words: ["berber", "sakal", "tiras"],
    terms: ["berber"],
  },
  {
    key: "kuafor",
    label: "kuaför",
    words: [
      "kuafor",
      "sac",
      "fon",
      "manikur",
      "pedikur",
      "guzellik",
      "makyaj",
      "cilt",
      "epilasyon",
    ],
    terms: ["kuaför", "güzellik"],
  },
  {
    key: "market",
    label: "market",
    words: ["market", "bakkal", "manav", "sarkuteri", "kasap", "alisveris"],
    terms: ["market", "manav"],
  },
  {
    key: "boya",
    label: "boya ustası",
    words: ["boya", "boyaci", "badana", "boyatma"],
    terms: ["boya"],
  },
  {
    key: "usta",
    label: "usta",
    words: [
      "usta",
      "tamir",
      "tamirci",
      "tesisat",
      "tesisatci",
      "elektrik",
      "elektrikci",
      "nakliyat",
      "nakliye",
      "montaj",
      "klima",
      "anahtarci",
    ],
    terms: ["usta", "tamir", "tesisat"],
  },
  {
    key: "saglik",
    label: "sağlık",
    words: [
      "doktor",
      "dis",
      "dentist",
      "klinik",
      "saglik",
      "eczane",
      "optik",
      "hastane",
      "poliklinik",
    ],
    terms: ["sağlık", "diş", "klinik"],
  },
  {
    key: "egitim",
    label: "eğitim",
    words: ["kurs", "egitim", "dershane", "okul", "etut", "ders"],
    terms: ["kurs", "eğitim"],
  },
  {
    key: "oto",
    label: "oto",
    words: ["oto", "araba", "arac", "yikama", "lastik", "motor", "otomotiv", "servis"],
    terms: ["oto", "yıkama", "lastik"],
  },
  {
    key: "giyim",
    label: "giyim",
    words: [
      "giyim",
      "elbise",
      "ayakkabi",
      "moda",
      "butik",
      "kiyafet",
      "tekstil",
      "gelinlik",
    ],
    terms: ["giyim", "ayakkabı", "butik"],
  },
  {
    key: "spor",
    label: "spor",
    words: ["spor", "fitness", "gym", "yuzme", "pilates", "yoga"],
    terms: ["spor", "fitness"],
  },
  {
    key: "organizasyon",
    label: "organizasyon",
    words: ["dugun", "organizasyon", "davet", "nisan", "dogumgunu"],
    terms: ["organizasyon", "düğün"],
  },
];
// Kategori adındaki anlamsız, çok genel kelimeler
const CAT_STOP = new Set([
  "ve",
  "ile",
  "diger",
  "genel",
  "hizmetleri",
  "hizmet",
  "hizmeti",
  "urunleri",
  "urunler",
  "icin",
  "sektoru",
  "isleri",
  "firmalari",
  "firmasi",
  "magazalari",
  "merkezi",
  "merkezleri",
  "uygulamalari",
  "sistemleri",
  "ekipmanlari",
  "malzemeleri",
  "satis",
  "satisi",
  "tamamlayici",
  "ozel",
  "kisisel",
  "ticari",
  "turkiye",
]);
const dynCache = new WeakMap();
// Veritabanındaki HER kategori adından otomatik bir grup üretir
// (diyetisyen, evcil hayvan, fotoğraf stüdyosu gibi hazır listede olmayanlar da tanınır).
function dynamicGroups(cats) {
  if (!cats || cats.length === 0) return [];
  const hit = dynCache.get(cats);
  if (hit) return hit;
  const out = [];
  for (const c of cats) {
    if (!c?.id || !c?.name) continue;
    const words = norm(c.name)
      .split(" ")
      .filter((t) => t.length >= 4 && !CAT_STOP.has(t));
    if (words.length === 0) continue;
    out.push({
      key: `cat:${c.id}`,
      label: lowerTr(c.name),
      words,
      terms: [c.name],
      categoryId: c.id,
    });
  }
  dynCache.set(cats, out);
  return out;
}
export function groupByKey(key, index) {
  if (!key) return undefined;
  return (
    GROUPS.find((g) => g.key === key) ||
    dynamicGroups(index.categories).find((g) => g.key === key)
  );
}
// ---------- İstek kelimeleri ----------
// "=" ile başlayanlar tam eşleşme ister, diğerleri ek alabilir.
const WANT_WORDS = {
  cheap: ["ucuz", "uygun", "ekonomik", "butce", "hesapli", "indirimli"],
  best: ["iyi", "puanli", "kaliteli", "populer", "begenilen", "onerilen", "yuksek"],
  expiring: [
    "=acil",
    "=acilen",
    "bitiyor",
    "biten",
    "bitmek",
    "kacirma",
    "bugun",
    "yarin",
    "=son",
    "=dakika",
  ],
  discount: ["indirim", "kampanya", "firsat", "bedava", "ucretsiz", "avantajli"],
  nearby: [
    "yakin",
    "yakinda",
    "yakinimda",
    "civarimda",
    "civarda",
    "etrafimda",
    "cevremde",
    "buralarda",
    "burada",
    "=en yakin",
  ],
};
const GREETING = [
  "merhaba",
  "selam",
  "selamlar",
  "slm",
  "mrb",
  "gunaydin",
  "iyi",
  "naber",
  "hey",
  "aksamlar",
  "gunler",
  "sabahlar",
  "hosgeldin",
];
const HELP = [
  "yardim",
  "nasil",
  "neler",
  "yapabilirsin",
  "kimsin",
  "kullanilir",
  "calisiyorsun",
];
const THANKS = ["tesekkur", "tesekkurler", "sagol", "eyvallah", "saol", "mersi"];
const ACK = [
  "tamam",
  "ok",
  "olur",
  "evet",
  "peki",
  "anladim",
  "super",
  "harika",
  "guzel",
];
const DISLIKE = [
  "olmadi",
  "hayir",
  "yok",
  "begenmedim",
  "istemiyorum",
  "kotu",
  "yetmedi",
  "baska",
];
const MORE = [
  "baska",
  "diger",
  "digerleri",
  "baskasi",
  "baskalari",
  "sonraki",
  "yenisi",
  "farkli",
  "devam",
];
// Soru kelimeleri (işletme hakkında)
const ATTR_WORDS = {
  hours: [
    "saat",
    "kapanis",
    "kapaniyor",
    "kapali",
    "acilis",
    "aciliyor",
    "acik",
    "mesai",
    "calisma",
    "kacta",
    "kaca",
  ],
  phone: ["telefon", "numara", "tel", "arayabilir", "arayayim", "iletisim", "gsm"],
  address: ["adres", "nerede", "neresi", "konum", "yol", "tarif", "ulasim", "nasil gid"],
  rating: ["puan", "yorum", "degerlendirme", "begeni"],
  campaign: ["kampanya", "indirim", "firsat"],
};
// İşletme adıyla doğrudan soru için yeterince açık soru kelimeleri
const STRONG_ATTR = [
  "saat",
  "kapanis",
  "kapaniyor",
  "acilis",
  "aciliyor",
  "calisma",
  "kacta",
  "kaca",
  "telefon",
  "numara",
  "adres",
  "puan",
  "yorum",
  "iletisim",
];
const GENERAL_WORDS = ["detay", "bilgi", "goster", "incele", "hakkinda", "anlat", "ac"];
const DEMONSTRATIVE = [
  "bunun",
  "bunu",
  "onun",
  "onu",
  "sunun",
  "sunu",
  "buranin",
  "oranin",
  "burasi",
  "orasi",
  "burayi",
  "orayi",
];
const ORDINALS = [
  { re: /^(ilk\w{0,5}|birinci\w{0,5})$/, index: 0 },
  { re: /^1$/, digit: true, index: 0 },
  { re: /^ikinci\w{0,5}$/, index: 1 },
  { re: /^2$/, digit: true, index: 1 },
  { re: /^ucuncu\w{0,5}$/, index: 2 },
  { re: /^3$/, digit: true, index: 2 },
  { re: /^sonuncu\w{0,5}$/, index: -1 },
];
const isOrdinalToken = (t) => ORDINALS.some((o) => o.re.test(t));
const STOP = new Set([
  "bir",
  "bana",
  "benim",
  "icin",
  "var",
  "mi",
  "mu",
  "misin",
  "musun",
  "onerir",
  "oner",
  "onerin",
  "onerebilir",
  "ara",
  "bul",
  "bulur",
  "bulabilir",
  "lutfen",
  "ben",
  "su",
  "an",
  "simdi",
  "de",
  "da",
  "ile",
  "ve",
  "en",
  "cok",
  "gibi",
  "olan",
  "olsun",
  "bak",
  "goster",
  "sunar",
  "yer",
  "yerler",
  "yeri",
  "isletme",
  "isletmeler",
  "bulunuyorum",
  "dayim",
  "deyim",
  "tayim",
  "teyim",
  "bu",
  "o",
  "hangi",
  "ne",
  "ya",
  "ama",
  "ister",
  "istiyorum",
  "lazim",
  "ariyorum",
  "arayan",
  "bulmak",
  "gitmek",
  "gidebilecegim",
  "gidilir",
  "hem",
  "bi",
  "bisey",
  "birsey",
  "acaba",
  "varmi",
  "midir",
  "mudur",
  "kac",
  "kaç",
  "daha",
  "fazla",
  "tane",
  "bana",
  "bize",
  "icin",
  "nerede",
  "kafe",
  "var",
]);
// ("kafe"/"var" yukarıda yanlışlıkla durak kelime olmasın diye aşağıda çıkarılır)
STOP.delete("kafe");
STOP.delete("nerede");
STOP.delete("goster");
// Ek sınırı: "bayrampasadayim" -> "bayrampasa" + "dayim"
export function tokenStartsWith(token, name) {
  if (!name || !token.startsWith(name)) return false;
  const extra = token.length - name.length;
  const limit = name.length <= 3 ? 2 : name.length <= 4 ? 3 : 8;
  return extra <= limit;
}
function matchName(tokens, haystack, name) {
  if (!name) return false;
  if (name.includes(" ")) return haystack.includes(` ${name}`);
  return tokens.some((t) => tokenStartsWith(t, name));
}
function wantHit(token, word) {
  if (word.startsWith("=")) return token === word.slice(1);
  return word.length >= 3 && tokenStartsWith(token, word);
}
// ---------- Konum ----------
export function findLocation(text, index, ctx = {}) {
  const n = norm(text);
  const tokens = n.split(" ").filter(Boolean);
  const haystack = ` ${n} `;
  const used = new Set();
  // İl
  let city;
  let cityLen = 0;
  for (const c of index.cities) {
    const cn = norm(c);
    if (cn.length > cityLen && matchName(tokens, haystack, cn)) {
      city = c;
      cityLen = cn.length;
    }
  }
  // İlçe (aynı adlı birden çok ilçe olabilir: il, önceki konuşma, işletme sayısı ile seç)
  let best;
  let bestLen = 0;
  let bestScore = -1;
  for (const d of index.districts) {
    const dn = norm(d.district);
    if (!matchName(tokens, haystack, dn)) continue;
    let score = 0;
    if (city && d.city === city) score += 100;
    else if (!city && ctx.city && d.city === ctx.city) score += 50;
    score += Math.min(d.count || 0, 40);
    if (dn.length > bestLen || (dn.length === bestLen && score > bestScore)) {
      best = d;
      bestLen = dn.length;
      bestScore = score;
    }
  }
  // İl yazılmışsa ve ilçe başka ile aitse ilçeyi yok say
  if (best && city && best.city !== city) {
    const same = index.districts.find(
      (d) => d.city === city && norm(d.district) === norm(best.district),
    );
    best = same || undefined;
  }
  if (best) {
    for (const t of tokens) if (tokenStartsWith(t, norm(best.district))) used.add(t);
  }
  if (city) {
    for (const t of tokens) if (tokenStartsWith(t, norm(city))) used.add(t);
  }
  return {
    city: best ? best.city : city,
    district: best?.district,
    matchedTokens: used,
  };
}
// Tam eşleşme yoksa yazım hatalı ilçe/il adını bulur ("bayrmpasa" -> Bayrampaşa)
function fuzzyLocation(pairs, skip, index, ctx) {
  let best;
  for (const p of pairs) {
    if (p.n.length < 6 || skip.has(p.n) || STOP.has(p.n)) continue;
    for (const d of index.districts) {
      const dn = norm(d.district);
      if (!nearWord(p.n, dn)) continue;
      const score =
        editDistance(p.n.slice(0, dn.length), dn) * 10 -
        Math.min(d.count || 0, 9) -
        (ctx.city === d.city ? 3 : 0);
      if (!best || score < best.score) {
        best = {
          city: d.city,
          district: d.district,
          from: p.o,
          to: d.district,
          token: p.n,
          score,
        };
      }
    }
    for (const c of index.cities) {
      const cn = norm(c);
      if (!nearWord(p.n, cn)) continue;
      const score = editDistance(p.n.slice(0, cn.length), cn) * 10 + 1;
      if (!best || score < best.score) {
        best = { city: c, district: undefined, from: p.o, to: c, token: p.n, score };
      }
    }
  }
  return best;
}
function scoreGroup(tokens, g) {
  const used = new Set();
  let score = 0;
  for (const t of tokens) {
    let best = 0;
    for (const w of g.words) {
      if (w.length >= 3 && tokenStartsWith(t, w)) {
        best = 1;
        break;
      }
      if (best < 0.6 && nearWord(t, w)) best = 0.6;
    }
    if (best > 0) {
      score += best;
      used.add(t);
    }
  }
  return { group: g, score, used };
}
function rankGroups(tokens, index) {
  const all = [...GROUPS, ...dynamicGroups(index.categories)];
  const scored = all.map((g) => scoreGroup(tokens, g)).filter((s) => s.score > 0);
  // Eşit puanda hazır gruplar önde, sonra üst kategori (alt kategorileri de kapsar)
  const parentOf = new Map((index.categories || []).map((c) => [c.id, c.parentId]));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aBuilt = a.group.categoryId ? 0 : 1;
    const bBuilt = b.group.categoryId ? 0 : 1;
    if (aBuilt !== bBuilt) return bBuilt - aBuilt;
    const aTop = a.group.categoryId && !parentOf.get(a.group.categoryId) ? 1 : 0;
    const bTop = b.group.categoryId && !parentOf.get(b.group.categoryId) ? 1 : 0;
    return bTop - aTop;
  });
  return scored;
}
// ---------- Önceki sonuçlara gönderme / işletme soruları ----------
function nameTokens(name) {
  return norm(name)
    .split(" ")
    .filter((t) => t.length >= 3 && !CAT_STOP.has(t));
}
function resolveTarget(tokens, shown, allowDigits) {
  const out = { viaName: false, viaOrdinal: false, viaDemo: false };
  if (shown.length === 0) return out;
  // Ordinal ("ilkini", "2.", "sonuncu")
  for (const o of ORDINALS) {
    if (o.digit && !allowDigits) continue;
    if (tokens.some((t) => o.re.test(t))) {
      const list = shown.filter((s) => s.kind === "business");
      const pool = list.length ? list : shown;
      const idx = o.index === -1 ? pool.length - 1 : o.index;
      if (pool[idx]) {
        out.target = pool[idx];
        out.viaOrdinal = true;
        return out;
      }
    }
  }
  // İsimle ("Mola Kafe", "mola'nın telefonu")
  const scores = shown.map((s) => {
    const nt = nameTokens(s.name);
    let sc = 0;
    for (const w of nt) {
      if (tokens.some((t) => tokenStartsWith(t, w) || (w.length >= 5 && nearWord(t, w))))
        sc += 1;
    }
    return { s, sc, total: nt.length };
  });
  const maxSc = Math.max(0, ...scores.map((x) => x.sc));
  if (maxSc > 0) {
    const top = scores.filter((x) => x.sc === maxSc);
    if (top.length === 1) {
      out.target = top[0].s;
      out.viaName = true;
      // Tek kelimelik eşleşme zayıf sayılır; çağıran bunu viaName+genel için değerlendirir
      out.nameScore = maxSc;
      return out;
    }
    out.candidates = top.map((x) => x.s);
    out.viaName = true;
    return out;
  }
  // "bunun", "onun"
  if (tokens.some((t) => DEMONSTRATIVE.includes(t))) {
    out.viaDemo = true;
    if (shown.length === 1) out.target = shown[0];
    else out.candidates = shown.filter((s) => s.kind === "business").slice(0, 4);
    if (out.candidates && out.candidates.length === 0) out.candidates = shown.slice(0, 4);
    return out;
  }
  return out;
}
function detectAttr(tokens, wantTokens) {
  const order = ["hours", "phone", "address", "rating", "campaign"];
  for (const a of order) {
    // "en iyi puanlı" bir istek kelimesidir, "puanı kaç" sorusu değil
    const pool = a === "rating" ? tokens.filter((t) => !wantTokens.has(t)) : tokens;
    if (
      pool.some((t) => ATTR_WORDS[a].some((w) => tokenStartsWith(t, w) && w.length >= 3))
    )
      return a;
  }
  return undefined;
}
export const VIBES = {
  sakin: {
    phrase: "sakin",
    say: "sakin",
    cat: [],
    text: [
      "sakin",
      "huzur",
      "sessiz",
      "dingin",
      "ferah",
      "dinlendirici",
      "rahat",
      "huzurlu",
      "sakin ortam",
    ],
    neg: ["canlı müzik", "hareketli", "eğlence", "parti", "gece kulübü", "karaoke"],
  },
  doga: {
    phrase: "doğa odaklı",
    say: "doğa",
    cat: [
      "park",
      "bahçe",
      "çiftlik",
      "kamp",
      "piknik",
      "orman",
      "tabiat",
      "mesire",
      "sahil",
      "tesis",
    ],
    text: [
      "doğa",
      "yeşil",
      "orman",
      "ağaç",
      "bahçe",
      "piknik",
      "mangal",
      "açık hava",
      "göl",
      "sahil",
      "deniz",
      "nehir",
      "dağ",
      "manzara",
      "teras",
      "çim",
      "kamp",
      "yürüyüş",
      "tabiat",
      "köy",
    ],
  },
  eglence: {
    phrase: "eğlenceli",
    say: "eğlenceli",
    cat: [
      "eğlence",
      "oyun",
      "sinema",
      "bowling",
      "bilardo",
      "escape",
      "organizasyon",
      "playstation",
    ],
    text: [
      "eğlence",
      "eğlenceli",
      "canlı müzik",
      "müzik",
      "parti",
      "oyun",
      "bowling",
      "sinema",
      "dans",
      "bilardo",
      "karaoke",
      "escape",
      "kutlama",
      "hareketli",
    ],
  },
  yemek: {
    phrase: "yemek odaklı",
    say: "yemek",
    cat: [
      "restoran",
      "lokanta",
      "yemek",
      "kebap",
      "pide",
      "pizza",
      "burger",
      "balık",
      "kahvaltı",
      "izgara",
      "çiğköfte",
      "döner",
      "ocakbaşı",
    ],
    text: [
      "yemek",
      "lezzet",
      "mutfak",
      "kahvaltı",
      "menü",
      "ev yemekleri",
      "kebap",
      "izgara",
      "balık",
      "pide",
      "et",
      "çorba",
    ],
  },
  kahve: {
    phrase: "kahve ve sohbet",
    say: "kahve",
    cat: ["kafe", "cafe", "kahve", "pastane", "tatlı", "çay", "kafeterya", "coffee"],
    text: [
      "kahve",
      "kafe",
      "çay",
      "tatlı",
      "pasta",
      "sohbet",
      "kahvaltı",
      "kek",
      "waffle",
    ],
  },
  bakim: {
    phrase: "bakım ve rahatlama",
    say: "bakım",
    cat: [
      "kuaför",
      "berber",
      "güzellik",
      "spa",
      "masaj",
      "hamam",
      "bakım",
      "estetik",
      "cilt",
      "tırnak",
      "manikür",
    ],
    text: [
      "bakım",
      "rahatla",
      "spa",
      "masaj",
      "hamam",
      "güzellik",
      "cilt",
      "saç",
      "tırnak",
      "manikür",
    ],
  },
  alisveris: {
    phrase: "alışveriş",
    say: "alışveriş",
    cat: [
      "market",
      "giyim",
      "butik",
      "ayakkabı",
      "mağaza",
      "alışveriş",
      "aksesuar",
      "hediye",
      "çiçek",
    ],
    text: ["alışveriş", "butik", "mağaza", "koleksiyon", "hediye", "giyim", "ayakkabı"],
  },
  aktif: {
    phrase: "aktif ve sportif",
    say: "spor",
    cat: [
      "spor",
      "fitness",
      "gym",
      "yüzme",
      "yoga",
      "pilates",
      "havuz",
      "halı saha",
      "bisiklet",
    ],
    text: [
      "spor",
      "fitness",
      "yoga",
      "pilates",
      "yüzme",
      "antrenman",
      "koşu",
      "bisiklet",
      "havuz",
      "halı saha",
    ],
  },
};
export const COMPANIONS = {
  aile: {
    label: "ailenle",
    say: "ailemle",
    text: ["aile", "çocuk", "oyun alanı", "geniş", "bebek", "aile salonu"],
  },
  sevgili: {
    label: "sevgilinle",
    say: "sevgilimle",
    text: ["romantik", "çift", "sevgili", "manzara", "teras", "özel", "mum"],
  },
  arkadas: {
    label: "arkadaşlarınla",
    say: "arkadaşlarımla",
    text: ["arkadaş", "grup", "sohbet", "geniş", "masa", "oyun"],
  },
  tek: {
    label: "tek başına",
    say: "tek başıma",
    text: ["kitap", "wifi", "internet", "sessiz", "çalış", "rahat"],
  },
};
const COMPANION_RE = [
  [
    "sevgili",
    /\b(sevgili\w*|romantik|esim\w*|nisanli\w*|(kiz|erkek) arkadas\w*|balayi\w*|yildonumu\w*)\b/,
  ],
  [
    "aile",
    /\b(aile\w*|cocuk\w*|anne\w*|baba\w*|dede\w*|nine\w*|bebek\w*|torun\w*|akraba\w*|kardes\w*)\b/,
  ],
  ["arkadas", /\b(arkadas\w*|grup\w*|ekip\w*|kanka\w*|dostlarla|dostum\w*)\b/],
  ["tek", /\b(tek basima|yalniz\w*|kendim|kendime)\b/],
];
const VIBE_RE = [
  [
    "sakin",
    /\b(sakin\w*|huzur\w*|sessiz\w*|dingin\w*|dinlen\w*|rahatla\w*|stres\w*|kalabaliksiz)\b/,
  ],
  [
    "doga",
    /\b(doga(?!lgaz)\w*|yesil\w*|orman\w*|agac\w*|bahce\w*|piknik\w*|kir(da|dan)?|mangal\w*|acik ?hava\w*|gol|golde|sahil\w*|deniz\w*|nehir\w*|dag|daga|dagda|tabiat\w*|yuruyus\w*|manzara\w*|cimen\w*|kamp(ta|tan|a|ci\w*|ing)?|hava almak)\b/,
  ],
  [
    "eglence",
    /\b(eglen\w*|hareketli|canli muzik|parti(ler|si|de|ye)?|oyun(lar|u|da|a|un)?|bowling|sinema\w*|bilardo|karaoke|escape|kutlama\w*)\b/,
  ],
  [
    "yemek",
    /\b(yemek\w*|karnim|acikt\w*|doyur\w*|kahvalti\w*|aksam yemegi|ogle yemegi|lezzet\w*|restoran\w*|lokanta\w*|kebap\w*|pide\w*|balik\w*|izgara\w*|burger|pizza)\b/,
  ],
  ["kahve", /\b(kahve\w*|kafe\w*|cafe|cay|cayi|tatli\w*|pasta\w*|sohbet\w*|coffee)\b/],
  [
    "bakim",
    /\b(bakim\w*|guzellik|spa|masaj\w*|hamam\w*|kuafor\w*|berber\w*|manikur|pedikur|cilt|tirnak|rahatlat\w*)\b/,
  ],
  ["alisveris", /\b(alisveris\w*|butik\w*|magaza\w*|giyim|hediye\w*|elbise\w*)\b/],
  [
    "aktif",
    /\b(spor\w*|fitness|gym|yoga|pilates|yuzme|kosu\w*|bisiklet\w*|antrenman\w*|havuz\w*|halisaha)\b/,
  ],
];
// Bunlardan biri yazılırsa tek başına bile "çıkış planı" sayılır.
// "bahçe", "kamp" gibi hizmet aramalarında da geçen kelimeler (bahçe düzenleme,
// kamp malzemesi) burada yok; onlar ancak "ailemle", "ne yapsam" gibi bir ipucuyla plan olur.
const SOFT_VIBES = ["sakin", "eglence"];
const DOGA_STRONG_RE =
  /\b(doga(?!lgaz)\w*|yesil\w*|orman\w*|piknik\w*|mangal\w*|acik ?hava\w*|gol|golde|sahil\w*|deniz\w*|nehir\w*|dag|daga|dagda|tabiat\w*|yuruyus\w*|manzara\w*|hava almak)\b/;
const PLAN_TRIGGER =
  /\b(ne yapsam|ne yapayim|ne yapalim|ne yapabilirim|ne yapabiliriz|ne yapilir|ne yapsak|ne yapacagim|nereye (gideyim|gidelim|gitsem|gitsek|gidebilirim|gidebiliriz|gidilir|cikayim|cikalim|cikilir)|gezmek|gezelim|gezsek|gezmeye|gezinti\w*|gezi|aktivite\w*|vakit gecir\w*|zaman gecir\w*|disari cik\w*|disariya cik\w*|cikmak ist\w*|sikildim|sikiliyorum|hava almak)\b/;
function detectPlan(n) {
  const trigger = PLAN_TRIGGER.test(n);
  let companion;
  for (const [c, re] of COMPANION_RE) {
    if (re.test(n)) {
      companion = c;
      break;
    }
  }
  const vibes = [];
  for (const [v, re] of VIBE_RE) if (re.test(n)) vibes.push(v);
  const soft = vibes.some((v) => SOFT_VIBES.includes(v)) || DOGA_STRONG_RE.test(n);
  if (!(trigger || (companion && vibes.length > 0) || soft)) return undefined;
  return { companion, vibes };
}
// ---------- ürün / hizmet araması ----------
// "matkap arıyorum", "lahmacun nerede bulabilirim": aranan şey kategori adı değil, bir ürün ya da hizmettir.
// Önce işletmelerin Hakkında yazısında, adında ve kampanyalarında aranır; kategori ipucu yalnızca yedektir.
// Cümlede geçen ama aranan şeyi anlatmayan kelimeler ("bulabilirim", "almak", "satan"...)
const ITEM_NOISE = new Set([
  "almak",
  "alacagim",
  "alabilirim",
  "alayim",
  "alsam",
  "satin",
  "satan",
  "satiyor",
  "satilan",
  "satilir",
  "satis",
  "ariyorum",
  "ariyoruz",
  "aramak",
  "arayan",
  "arasam",
  "bakiyorum",
  "bakmak",
  "bakiniyor",
  "istiyorum",
  "isterim",
  "gerek",
  "gerekiyor",
  "yaptiracagim",
  "yaptirmak",
  "yapilir",
  "yapan",
  "yapiyor",
  "fiyati",
  "fiyat",
  "fiyatlari",
  "kac",
  "kaca",
  "nerde",
  "nereden",
  "nasil",
  "musait",
  "tavsiye",
  "bulabilirim",
  "bulabilir",
  "bulurum",
  "bulmak",
  "bulunur",
  "bulunuyor",
  "bulayim",
  "getirir",
  "tedarik",
  "temin",
  "varmi",
  "mevcut",
  "lazimdi",
  "ihtiyacim",
  "ihtiyac",
  "arıyom",
  "arıyorum",
  "ariyom",
  "var",
  "yok",
  "gerekli",
  "elimde",
  "yakin",
  "yakinda",
  "civarda",
]);
const ITEM_NOISE_PREFIX =
  /^(bulab|bulun|alabil|alacag|satil|satiy|yaptir|ariyor|bakiyor|istiy|bulur|bulma)/;
export const isItemNoise = (t) => ITEM_NOISE.has(t) || ITEM_NOISE_PREFIX.test(t);
// Kategori grubunun içinden gelen ama aslında belirli bir ürün olan kelimeler:
// "lahmacun nerede bulabilirim" -> restoran türü + aranan ürün "lahmacun"
export const ITEM_TOKENS = new Set([
  "lahmacun",
  "kebap",
  "pide",
  "corba",
  "balik",
  "doner",
  "pizza",
  "burger",
  "izgara",
  "ocakbasi",
  "kahvalti",
  "tatli",
  "elbise",
  "ayakkabi",
  "gelinlik",
  "kiyafet",
  "lastik",
  "klima",
]);
// Ürün kelimesi -> kategori adında aranacak ipuçları (yalnızca yedek eşleşme; asıl ölçüt açıklama ve kampanyadır)
export const ITEM_HINTS = [
  {
    words: [
      "matkap",
      "tornavida",
      "civata",
      "vida",
      "civi",
      "cekic",
      "pense",
      "testere",
      "zimpara",
      "silikon",
      "kilit",
      "mentese",
      "somun",
      "dubel",
      "kelepce",
      "hortum",
      "rulo",
      "kazma",
      "kurek",
      "boru",
      "musluk",
      "sifon",
    ],
    cats: ["nalbur", "hirdavat", "yapi market", "yapi malzeme"],
  },
  {
    words: ["priz", "ampul", "kablo", "sigorta", "led", "avize", "aydinlatma", "anahtar"],
    cats: ["elektrik", "aydinlatma", "hirdavat"],
  },
  {
    words: ["cicek", "buket", "orkide", "saksi", "fidan"],
    cats: ["cicek", "cicekci", "peyzaj"],
  },
  {
    words: ["ekmek", "simit", "pogaca", "borek", "unlu"],
    cats: ["firin", "pastane", "unlu mamul"],
  },
  { words: ["ilac", "vitamin", "surup", "krem"], cats: ["eczane", "saglik"] },
  { words: ["gozluk", "lens", "cerceve"], cats: ["optik"] },
  {
    words: ["kedi", "kopek", "mama", "kum", "akvaryum", "kus", "yem"],
    cats: ["pet", "evcil", "hayvan", "veteriner"],
  },
  {
    words: ["defter", "kalem", "kirtasiye", "dosya", "fotokopi"],
    cats: ["kirtasiye", "ofis"],
  },
  {
    words: ["aku", "balata", "yag", "silecek", "jant"],
    cats: ["oto", "lastik", "yedek parca"],
  },
  {
    words: ["telefon", "ekran", "bilgisayar", "laptop", "tablet", "sarj", "kilif"],
    cats: ["telefon", "bilgisayar", "elektronik", "teknik servis"],
  },
  { words: ["bisiklet", "scooter"], cats: ["bisiklet", "spor"] },
  {
    words: ["mobilya", "koltuk", "yatak", "dolap", "masa", "sandalye"],
    cats: ["mobilya", "ev tekstil", "dekorasyon"],
  },
  {
    words: ["perde", "hali", "nevresim", "havlu"],
    cats: ["ev tekstil", "perde", "hali"],
  },
  { words: ["oyuncak", "bebek arabasi"], cats: ["oyuncak", "bebek", "cocuk"] },
  { words: ["kitap", "roman"], cats: ["kitap", "kirtasiye"] },
];
const placeCache = new WeakMap();
function placeTokens(index) {
  const hit = placeCache.get(index);
  if (hit) return hit;
  const set = new Set();
  const add = (name) => {
    const nn = norm(name);
    if (!nn) return;
    set.add(nn);
    nn.split(" ").forEach((t) => {
      if (t.length >= 5) set.add(t);
    });
  };
  (index.cities || []).forEach(add);
  (index.districts || []).forEach((d) => add(d.district));
  placeCache.set(index, set);
  return set;
}
// ---------- Ana çözümleyici ----------
const WORD_RE = /[A-Za-zÇĞİıÖŞÜçğöşüâîû0-9]+/g;
export function parseQuery(text, index, ctx = {}) {
  const n = norm(text);
  const pairs = (text.match(WORD_RE) || [])
    .map((o) => ({ o, n: norm(o) }))
    .filter((p) => p.n);
  const tokens = pairs.map((p) => p.n);
  const wants = {
    cheap: false,
    best: false,
    expiring: false,
    discount: false,
    nearby: false,
  };
  const wantTokens = new Set();
  Object.keys(WANT_WORDS).forEach((k) => {
    for (const t of tokens) {
      if (WANT_WORDS[k].some((w) => wantHit(t, w))) {
        wants[k] = true;
        wantTokens.add(t);
      }
    }
  });
  if (/\ben yakin\b/.test(n)) wants.nearby = true;
  const isGreeting =
    tokens.length > 0 &&
    tokens.length <= 4 &&
    tokens.every((t) => GREETING.includes(t) || STOP.has(t));
  const isThanks = tokens.some((t) => THANKS.some((w) => t.startsWith(w)));
  const isHelp = tokens.some((t) => HELP.some((w) => t.startsWith(w)));
  const isAck = tokens.length <= 3 && tokens.every((t) => ACK.includes(t) || STOP.has(t));
  const isDislike =
    tokens.length <= 4 &&
    tokens.some((t) => DISLIKE.includes(t)) &&
    !tokens.some((t) => MORE.includes(t) && t !== "baska");
  const moreWord =
    tokens.some((t) => MORE.includes(t)) ||
    /\bdaha (fazla|cok)\b|\bbir (tane|tanesi) daha\b/.test(n);
  // ---- konum ----
  const loc = findLocation(text, index, ctx);
  let city = loc.city;
  let district = loc.district;
  const skipTokens = new Set(loc.matchedTokens);
  let fuzzy;
  // ---- tür ----
  const ranked = rankGroups(tokens, index);
  const top = ranked[0];
  const groupTokens = new Set(top ? top.used : []);
  if (!city && !district) {
    const fz = fuzzyLocation(
      pairs.filter((p) => !groupTokens.has(p.n) && !wantTokens.has(p.n)),
      skipTokens,
      index,
      ctx,
    );
    if (fz) {
      city = fz.city;
      district = fz.district;
      skipTokens.add(fz.token);
      fuzzy = { from: fz.from, to: fz.to };
    }
  }
  let group = top?.group;
  const candidates = top
    ? ranked
        .filter(
          (r) =>
            r !== top &&
            r.score >= top.score - 0.01 &&
            r.group.key !== top.group.key &&
            norm(r.group.label) !== norm(top.group.label),
        )
        .map((r) => r.group)
        .slice(0, 4)
    : [];
  // Cümlede başka bir tür daha varsa ("kafe ve berber")
  const also = top
    ? ranked
        .filter((r) => r.score >= 0.6 && ![...r.used].some((u) => groupTokens.has(u)))
        .map((r) => r.group)
        .slice(0, 1)
    : [];
  // ---- işletme sorusu / önceki sonuçlara gönderme ----
  const shown = ctx.shown || [];
  const attrFound = detectAttr(tokens, wantTokens);
  const generalWord = tokens.some((t) => GENERAL_WORDS.includes(t));
  const res = resolveTarget(tokens, shown, !!attrFound);
  const nameScore = res.nameScore;
  // "bunun telefonu": en son konuşulan işletme biliniyorsa onu seç
  if (ctx.focus && res.viaDemo && !res.viaName && !res.viaOrdinal) {
    res.target = ctx.focus;
    res.candidates = undefined;
  }
  let ask;
  if (shown.length > 0) {
    const strongRef =
      res.viaOrdinal || res.viaDemo || (res.viaName && (nameScore || 0) >= 2);
    if (attrFound && (res.target || res.candidates)) {
      ask = { attr: attrFound, target: res.target, candidates: res.candidates };
    } else if (
      attrFound &&
      attrFound !== "campaign" &&
      !group &&
      !city &&
      !district &&
      !wants.nearby
    ) {
      // "telefonu ne?" : konuşulan işletme / tek sonuç varsa o, çoksa hangisi diye sor
      if (ctx.focus) ask = { attr: attrFound, target: ctx.focus };
      else if (shown.length === 1) ask = { attr: attrFound, target: shown[0] };
      else
        ask = {
          attr: attrFound,
          candidates: shown.filter((s) => s.kind === "business").slice(0, 4),
        };
    } else if ((res.target || res.candidates) && (strongRef || generalWord)) {
      ask = { attr: "general", target: res.target, candidates: res.candidates };
    }
    if (ask && ask.candidates && ask.candidates.length === 0) ask = undefined;
  }
  // Önceki sonuçlarda olmayan bir işletme adı yazıldıysa ("Mola Kafe telefon"): adıyla ara
  if (
    !ask &&
    !res.target &&
    !res.candidates &&
    attrFound &&
    attrFound !== "campaign" &&
    !wants.nearby &&
    tokens.some((t) => STRONG_ATTR.some((w) => tokenStartsWith(t, w)))
  ) {
    const usable = pairs.filter(
      (p) =>
        p.n.length >= 2 &&
        !STOP.has(p.n) &&
        !skipTokens.has(p.n) &&
        !wantTokens.has(p.n) &&
        !GREETING.includes(p.n) &&
        !ACK.includes(p.n) &&
        !MORE.includes(p.n) &&
        !DISLIKE.includes(p.n) &&
        !HELP.some((w) => p.n.startsWith(w)) &&
        !THANKS.some((w) => p.n.startsWith(w)) &&
        !ATTR_WORDS[attrFound].some((w) => tokenStartsWith(p.n, w)) &&
        !GENERAL_WORDS.includes(p.n) &&
        !DEMONSTRATIVE.includes(p.n) &&
        !isOrdinalToken(p.n),
    );
    const full = usable.map((p) => lowerTr(p.o)).join(" ");
    const short = usable
      .filter((p) => !groupTokens.has(p.n))
      .map((p) => lowerTr(p.o))
      .join(" ");
    if (short) {
      ask = {
        attr: attrFound,
        lookups: full === short ? [full] : [full, short],
        city: loc.city,
        district: loc.district,
      };
    }
  }
  // ---- çıkış planı ("bugün ne yapsam", "ailemle sakin bir yer") ----
  let plan;
  const planReq = detectPlan(n);
  if (planReq) {
    // "ilkinin telefonu" gibi önceki sonuçlara gönderme varsa soru öncelikli
    const viaRef = !!(res.viaOrdinal || res.viaDemo || res.viaName);
    if (!ask || !viaRef) {
      plan = planReq;
      ask = undefined;
      group = undefined;
      wants.expiring = false; // "bugün ne yapsam"daki "bugün" biten kampanya isteği değil
    }
  }
  // Soru olarak anlaşıldıysa kampanya/indirim kelimeleri arama isteği sayılmaz
  if (ask) {
    wants.discount = false;
    wants.cheap = false;
    wants.expiring = false;
    wants.nearby = false;
    group = undefined;
  }
  // ---- serbest metin (bilinmeyen kelimeler) ----
  const onlyPairs = pairs.filter((p) => !STOP.has(p.n));
  const leftover = onlyPairs.filter(
    (p) =>
      p.n.length >= 3 &&
      !skipTokens.has(p.n) &&
      !groupTokens.has(p.n) &&
      !wantTokens.has(p.n) &&
      !GREETING.includes(p.n) &&
      !ACK.includes(p.n) &&
      !MORE.includes(p.n) &&
      !DISLIKE.includes(p.n) &&
      !HELP.some((w) => p.n.startsWith(w)) &&
      !THANKS.some((w) => p.n.startsWith(w)) &&
      !(
        attrFound &&
        attrFound !== "general" &&
        ATTR_WORDS[attrFound].some((w) => tokenStartsWith(p.n, w))
      ) &&
      !GENERAL_WORDS.includes(p.n) &&
      !DEMONSTRATIVE.includes(p.n) &&
      !isOrdinalToken(p.n) &&
      !isItemNoise(p.n) &&
      !placeTokens(index).has(p.n),
  );
  let freeText =
    !group && !ask && !plan && leftover.length > 0
      ? leftover
          .slice(0, 2)
          .map((p) => lowerTr(p.o))
          .join(" ")
      : undefined;
  // ---- aranan ürün / hizmet ----
  // Tanınmayan kelime ("matkap") ya da bir türün içindeki belirli ürün ("lahmacun")
  let item = freeText;
  if (!item && group && !group.categoryId && !ask && !plan) {
    for (const t of groupTokens) {
      if (ITEM_TOKENS.has(t)) {
        const o = pairs.find((p) => p.n === t);
        item = o ? lowerTr(o.o) : t;
        break;
      }
    }
  }
  // ---- niyet ----
  const wantSignal =
    !isGreeting &&
    (wants.cheap || wants.best || wants.expiring || wants.discount || wants.nearby);
  const hasSignal = !!(city || district || group || freeText || wantSignal);
  let intent = "search";
  if (ask) intent = "ask";
  else if (plan) intent = "plan";
  else if (!hasSignal) {
    if (isThanks) intent = "thanks";
    else if (moreWord && ctx.lastQuery) intent = "more";
    else if (isDislike) intent = "dislike";
    else if (isAck) intent = "ack";
    else if (isHelp) intent = "help";
    else if (isGreeting) intent = "greeting";
    else intent = "help";
  } else if (
    !city &&
    !district &&
    !group &&
    !freeText &&
    moreWord &&
    ctx.lastQuery &&
    !wantSignal
  ) {
    intent = "more";
  }
  // Konum yazılmadıysa önceki konuşmadan al
  let locationFromContext = false;
  if (!city && !district && (ctx.city || ctx.district)) {
    city = ctx.city;
    district = ctx.district;
    locationFromContext = true;
  }
  // Önceki aramada ürün/hizmet vardı ("matkap") ve şimdi yalnızca yer yazıldı ("Esenler"): aranan şeyi koru
  const typedGroup = !!group;
  if (
    intent === "search" &&
    !typedGroup &&
    !freeText &&
    !item &&
    ctx.lastQuery?.item &&
    // yalnızca yer yazıldı ("Esenler") ya da "ucuz olan", "en iyi puanlı" gibi bir daraltma geldi
    (((city || district) && !locationFromContext) || wantSignal)
  ) {
    item = ctx.lastQuery.item;
    freeText = ctx.lastQuery.freeText;
  }
  // Sadece "ucuz olan?" gibi bir devam sorusu: önceki kategoriyi koru
  if (!group && !freeText && ctx.groupKey && intent === "search" && !wants.discount) {
    group = groupByKey(ctx.groupKey, index);
  }
  return {
    raw: String(text || "").slice(0, 200),
    intent,
    city,
    district,
    group,
    alsoGroups: also.filter((g) => g.key !== group?.key),
    groupCandidates: candidates,
    freeText,
    wants,
    more: moreWord,
    locationFromContext,
    fuzzy,
    ask,
    plan,
    item,
  };
}
