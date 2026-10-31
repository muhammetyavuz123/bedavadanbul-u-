// BedavadanBul Asistan — öneri motoru (v2).
// Anlaşılan isteği (nlu.ts) uygulamanın KENDİ işletme ve kampanya uçlarına
// çevirir; sonuçları puanlar, işletme sorularını (saat, telefon, adres...)
// yanıtlar, "yakınımda" ve "başka" gibi devam isteklerini yönetir ve
// bulunamayan aramaları kaydeder. Dışarıdan veri/AI yok.
//
// Bu dosya platformdan bağımsızdır: ağ işlemleri `deps` ile dışarıdan verilir
// (mobilde axios servisleri, webde apiRequest).
import { COMPANIONS, ITEM_HINTS, VIBES, locative, norm, tokenStartsWith } from "./nlu";
// ---------- yardımcılar ----------
const asArray = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};
const daysLeftOf = (d) => {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
};
async function safe(p) {
  try {
    return await p;
  } catch {
    return null;
  }
}
const cap = (s) => (s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s);
export function haversineKm(a, b) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function formatKm(km) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`.replace(".", ",");
}
const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : null;
};
function toPostHit(p) {
  if (!p?.id) return null;
  const dl = daysLeftOf(p.expireDate);
  if (dl !== null && dl <= 0) return null; // süresi dolmuş
  const lat = num(p.latitude);
  const lng = num(p.longitude);
  const ok = lat !== null && lng !== null && !(lat === 0 && lng === 0);
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    city: p.city,
    district: p.district,
    images: p.images,
    expireDate: p.expireDate,
    listingType: p.listingType,
    createdAt: p.createdAt,
    businessId: p.businessId,
    daysLeft: dl,
    lat: ok ? lat : null,
    lng: ok ? lng : null,
  };
}
function talk(text, chips = []) {
  return {
    kind: "talk",
    text,
    businesses: [],
    campaigns: [],
    chips,
    shown: [],
    fresh: false,
  };
}
function topPlaceChips(index, label, n = 4) {
  return [...index.districts]
    .filter((d) => (d.count || 0) > 0)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, n)
    .map((d) => ({ label: d.district, text: `${d.district} ${label || ""}`.trim() }));
}
// ---------- kategori / arama terimleri ----------
function matchCategoryIds(categories, terms) {
  const wanted = terms.map((t) => norm(t)).filter((t) => t.length >= 3);
  if (wanted.length === 0) return [];
  const ids = [];
  for (const c of categories || []) {
    const tokens = norm(c?.name || "").split(" ");
    if (tokens.some((tok) => wanted.some((w) => tok.startsWith(w)))) {
      if (c?.id && !ids.includes(c.id)) ids.push(c.id);
    }
  }
  return ids.slice(0, 6);
}
// API, ana kategori verilince alt kategorileri de kapsar
function categoryIdsFor(q, categories) {
  const g = q.group;
  if (g?.categoryId) return [g.categoryId];
  const terms = g ? g.terms.slice(0, 3) : q.freeText ? [q.freeText] : [];
  return terms.length ? matchCategoryIds(categories, terms) : [];
}
function searchTermsFor(q) {
  const g = q.group;
  if (g?.categoryId) return []; // veritabanı kategorisi: ada göre değil kategoriye göre ara
  if (g) return g.terms.slice(0, 2);
  return q.freeText ? [q.freeText] : [];
}
function postTermsFor(q) {
  const g = q.group;
  if (g?.categoryId) return [];
  return searchTermsFor(q);
}
// ---------- ürün / hizmet araması yardımcıları ----------
const stripPlural = (t) => (t.length > 5 && /(lar|ler)$/.test(t) ? t.slice(0, -3) : t);
// "kedi maması" -> ["kedi", "mamasi"] (norm, en az 3 harf, çoğul eki atılmış)
function itemTokens(item) {
  return norm(item || "")
    .split(" ")
    .filter((t) => t.length >= 3)
    .map(stripPlural)
    .slice(0, 3);
}
// API'ye gönderilecek arama kelimeleri: önce bütün ifade, sonra tek tek kelimeler
function itemSearches(item) {
  const phrase = String(item || "").trim();
  if (!phrase) return [];
  const toks = phrase.split(/\s+/).filter((t) => norm(t).length >= 3);
  const out = [phrase, ...toks.filter((t) => t !== phrase)];
  return [...new Set(out)].slice(0, 3);
}
// Ürün kelimesine göre kategori ipucu (yedek eşleşme)
function itemHintCategoryIds(item, categories) {
  const toks = new Set(norm(item || "").split(" "));
  const catWords = [];
  for (const h of ITEM_HINTS) {
    if (
      h.words.some(
        (w) =>
          toks.has(w) ||
          [...toks].some((t) => t.length >= 5 && t.startsWith(w) && w.length >= 4),
      )
    ) {
      catWords.push(...h.cats);
    }
  }
  if (catWords.length === 0) return [];
  const ids = [];
  for (const c of categories || []) {
    const cn = norm(c?.name || "");
    if (
      catWords.some(
        (w) =>
          cn.includes(w) || cn.split(" ").some((t) => t.length >= 4 && w.startsWith(t)),
      )
    ) {
      if (c?.id && !ids.includes(c.id)) ids.push(c.id);
    }
  }
  return ids.slice(0, 4);
}
const hasTok = (tokens, t) =>
  tokens.some(
    (x) =>
      x === t ||
      (x.length > t.length && x.startsWith(t)) ||
      (t.length > 5 && x.length >= 5 && t.startsWith(x) && t.length - x.length <= 2),
  );
async function fetchRaw(q, env, scope) {
  const { deps } = env;
  const categoryIds = categoryIdsFor(q, env.categories);
  const searches = itemSearches(q.item);
  // Ürün aramasında ("matkap") sadece ada bakan eski arama yerine açıklamaya da bakan arama kullanılır
  const terms = q.item && !q.group ? [] : searchTermsFor(q);
  const hintIds = itemHintCategoryIds(q.item, env.categories);
  // ---- işletmeler ----
  const bizCalls = [];
  const base = {
    city: scope.city,
    district: scope.district,
    limit: 24,
    detail: q.item ? 1 : undefined,
  };
  const sort = q.wants.best ? "rating" : undefined;
  categoryIds
    .slice(0, 4)
    .forEach((id) =>
      bizCalls.push(safe(deps.listBusinesses({ ...base, category: id, sort }))),
    );
  terms
    .slice(0, 2)
    .forEach((t) =>
      bizCalls.push(safe(deps.listBusinesses({ ...base, search: t, sort }))),
    );
  if (!categoryIds.length && !terms.length && !searches.length) {
    bizCalls.push(safe(deps.listBusinesses({ ...base, limit: 24, sort: "rating" })));
  }
  searches.forEach((t) =>
    bizCalls.push(
      safe(deps.listBusinesses({ ...base, limit: 50, search: t, deep: 1, sort })),
    ),
  );
  hintIds.forEach((id) =>
    bizCalls.push(safe(deps.listBusinesses({ ...base, limit: 50, category: id, sort }))),
  );
  // ---- kampanyalar ----
  const postCalls = [];
  const pbase = { city: scope.city, district: scope.district, approved: true, limit: 40 };
  if (q.group?.categoryId) {
    postCalls.push(safe(deps.getPosts({ ...pbase, categoryId: q.group.categoryId })));
  } else if (postTermsFor(q).length && !(q.item && !q.group)) {
    postTermsFor(q)
      .slice(0, 2)
      .forEach((t) => postCalls.push(safe(deps.getPosts({ ...pbase, search: t }))));
  } else if (!searches.length) {
    postCalls.push(safe(deps.getPosts(pbase)));
  }
  // Kampanya başlığında, kategorisinde ya da açıklamasında aranan ürün geçenler
  searches
    .slice(0, 2)
    .forEach((t) => postCalls.push(safe(deps.getPosts({ ...pbase, search: t }))));
  const [bizRes, postRes] = await Promise.all([
    Promise.all(bizCalls),
    Promise.all(postCalls),
  ]);
  const bizMap = new Map();
  bizRes.forEach((r) => asArray(r).forEach((b) => b?.id && bizMap.set(b.id, b)));
  const postMap = new Map();
  postRes.forEach((r) =>
    asArray(r).forEach((p) => {
      const hit = toPostHit(p);
      if (hit) postMap.set(hit.id, hit);
    }),
  );
  return {
    businesses: [...bizMap.values()],
    posts: [...postMap.values()],
    categoryIds,
    hintIds,
  };
}
// ---------- sıralama ----------
const typeRank = (t) => (t === "doping" ? 3 : t === "featured" ? 2 : 1);
const priceOf = (p) => (p.price && p.price > 0 ? p.price : Number.MAX_SAFE_INTEGER);
function postSorter(q) {
  return (a, b) => {
    if (q.wants.expiring) return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
    if (q.wants.cheap) return priceOf(a) - priceOf(b);
    if (typeRank(b.listingType) !== typeRank(a.listingType))
      return typeRank(b.listingType) - typeRank(a.listingType);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  };
}
function rank(raw, q, exclude, coords) {
  const byBiz = new Map();
  raw.posts.forEach((p) => {
    if (!p.businessId) return;
    const arr = byBiz.get(p.businessId) || [];
    arr.push(p);
    byBiz.set(p.businessId, arr);
  });
  const sorter = postSorter(q);
  const useDistance = !!(q.wants.nearby && coords);
  const itemToks = itemTokens(q.item);
  const itemWords = String(q.item || "")
    .split(/\s+/)
    .filter(Boolean);
  const titleHit = (p) => {
    const toks = norm(p.title).split(" ");
    return itemToks.filter((t) => hasTok(toks, t));
  };
  const scored = raw.businesses
    .filter((b) => !exclude.has(b.id))
    .map((b) => {
      const posts = [...(byBiz.get(b.id) || [])].sort(sorter);
      let campaign = posts[0];
      // ---- aranan ürün / hizmet: açıklama, ad ve kampanya başlığı ----
      let relevance = 0;
      let why;
      let itemHit = false;
      if (itemToks.length) {
        const dN = norm(b.description || "").split(" ");
        const nN = norm(b.name || "").split(" ");
        const dHit = itemToks.filter((t) => hasTok(dN, t));
        const nHit = itemToks.filter((t) => !dHit.includes(t) && hasTok(nN, t));
        const cPost = posts.find((p) => titleHit(p).length > 0);
        const cHit = cPost ? titleHit(cPost) : [];
        relevance = dHit.length * 5 + nHit.length * 4 + (cHit.length ? 5 : 0);
        itemHit = relevance > 0;
        if (cPost) campaign = cPost;
        const show = (hits) => {
          const ws = itemWords.filter((w) => hits.includes(stripPlural(norm(w))));
          return (ws.length ? ws : [q.item || ""]).map((w) => `“${w}”`).join(", ");
        };
        const bits = [];
        if (dHit.length) bits.push(`açıklamasında ${show(dHit)} geçiyor`);
        if (nHit.length) bits.push(`adında ${show(nHit)} geçiyor`);
        if (cPost) bits.push(`“${cPost.title}” kampanyası var`);
        // Yazıda geçmiyor ama türü uygun: yedek eşleşme (dürüstçe belirtilir)
        const catOk = q.group
          ? true
          : !!(b.category?.id && raw.hintIds?.includes(b.category.id));
        if (!itemHit && catOk) {
          relevance = 2.5;
          bits.push(
            `${b.category?.name ? `kategorisi ${b.category.name}` : "türü uygun"}; açıklamasında “${q.item}” yazmıyor`,
          );
        }
        const c = b.ratingCount || 0;
        if (c > 0)
          bits.push(`${(b.ratingAvg || 0).toFixed(1).replace(".", ",")}/5 (${c} yorum)`);
        if (campaign && !cPost) bits.push("kampanyası var");
        why = bits.join(" · ");
      }
      const count = b.ratingCount || 0;
      const avg = b.ratingAvg || 0;
      // Az yorumlu işletmenin puanı tam sayılmaz (3 yorumdan sonra tam ağırlık)
      const ratingScore = avg * Math.min(1, count / 3);
      let score = ratingScore * (q.wants.best ? 2 : 1);
      if (campaign)
        score += q.wants.discount || q.wants.cheap || q.wants.expiring ? 5 : 3;
      if (campaign && q.wants.expiring && (campaign.daysLeft ?? 99) <= 3) score += 3;
      if (b.isFeatured) score += 1;
      if (b.isVerified) score += 0.5;
      score += relevance * 2;
      let distanceKm;
      if (useDistance && coords) {
        for (const p of posts) {
          if (p.lat == null || p.lng == null) continue;
          const d = haversineKm(coords, { lat: p.lat, lng: p.lng });
          if (distanceKm === undefined || d < distanceKm) distanceKm = d;
        }
      }
      return { business: b, campaign, score, distanceKm, relevance, why, itemHit };
    });
  // "Bugün biten kampanyalar" gibi kategorisiz kampanya aramalarında yalnızca
  // kampanyası olan işletmeler gösterilir
  const campaignOnly = (q.wants.discount || q.wants.expiring) && !q.group && !q.freeText;
  let pool = campaignOnly ? scored.filter((s) => s.campaign) : scored;
  // Ürün aramasında ilgisiz işletmeler listelenmez
  if (itemToks.length) pool = pool.filter((s) => s.relevance > 0);
  pool.sort((a, b) => {
    if (useDistance) {
      const ad = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
      const bd = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
      if (ad !== bd) return ad - bd;
    }
    return b.score - a.score;
  });
  const top = pool.slice(0, 3);
  const businesses = top.map(({ business, campaign, distanceKm, why, itemHit }) => ({
    business,
    campaign,
    distanceKm,
    why,
    itemHit,
  }));
  const shownPost = new Set(businesses.map((x) => x.campaign?.id).filter(Boolean));
  const shownBiz = new Set(businesses.map((x) => x.business.id));
  const rest = raw.posts
    .filter(
      (p) =>
        !exclude.has(p.id) &&
        !shownPost.has(p.id) &&
        !(p.businessId && (shownBiz.has(p.businessId) || exclude.has(p.businessId))),
    )
    .sort((a, b) => {
      if (itemToks.length) {
        const d = titleHit(b).length - titleHit(a).length;
        if (d !== 0) return d;
      }
      return sorter(a, b);
    });
  const wantCampaigns = q.wants.discount || q.wants.cheap || q.wants.expiring;
  const campaigns = rest.slice(0, wantCampaigns || businesses.length === 0 ? 4 : 2);
  const remaining =
    Math.max(0, pool.length - top.length) + Math.max(0, rest.length - campaigns.length);
  return { businesses, campaigns, remaining };
}
// ---------- "yakınımda": koordinattan bölge çıkarma ----------
// İşletmelerin koordinatı yok; kampanyaların var. En yakın kampanya konumundan
// ilçe/il çıkarılır (en fazla 30 km), mesafeler yaklaşıktır.
async function inferPlace(coords, q, env) {
  const { deps } = env;
  const params = { approved: true, limit: 50 };
  if (q.group?.categoryId) params.categoryId = q.group.categoryId;
  else if (postTermsFor(q)[0]) params.search = postTermsFor(q)[0];
  const pick = (list) => {
    let best = null;
    for (const p of list) {
      if (p.lat == null || p.lng == null) continue;
      const km = haversineKm(coords, { lat: p.lat, lng: p.lng });
      if (!best || km < best.km) best = { p, km };
    }
    return best;
  };
  const toHits = (res) => asArray(res).map(toPostHit).filter(Boolean);
  let best = pick(toHits(await safe(deps.getPosts(params))));
  if ((!best || best.km > 30) && (params.categoryId || params.search)) {
    // Türe göre bulamadıysak yine de bölgeyi anlamak için genel kampanyalara bak
    const generic = pick(
      toHits(await safe(deps.getPosts({ approved: true, limit: 50 }))),
    );
    if (generic && (!best || generic.km < best.km)) best = generic;
  }
  if (!best || best.km > 30 || (!best.p.city && !best.p.district)) return null;
  return {
    city: best.p.city || undefined,
    district: best.p.district || undefined,
    km: best.km,
  };
}
// ---------- ipuçları / sohbet ----------
export function helpReply(index) {
  return {
    ...talk(
      'Ben BedavadanBul asistanıyım. Bulunduğun ilçeyi ve ne aradığını yaz, uygulamadaki gerçek işletme ve kampanyalardan sana öneririm. Örneğin:\n• Bayrampaşa\'dayım, bir kafe önerir misin?\n• Kadıköy\'de ucuz berber\n• Yakınımda restoran\n• Ailemle sakin bir yerde doğa ile gezinti\n• Bugün ne yapsam?\n• Boya ustası lazım\n• Bugün biten kampanyalar\n\nÖnerdiklerim hakkında da sorabilirsin: "ilkinin telefonu", "adresi nerede", "kaçta kapanıyor". Bulamadığım aramalar, eksikleri tamamlamak için isimsiz olarak not edilir.',
      [
        { label: "Bugün ne yapsam?", text: "bugün ne yapsam" },
        { label: "Kafe öner", text: "kafe öner" },
        { label: "Yakınımda restoran", text: "yakınımda restoran" },
        { label: "Bugün biten kampanyalar", text: "bugün biten kampanyalar" },
      ],
    ),
  };
}
function smallTalk(q, ctx, env) {
  const label = ctx.lastQuery?.group?.label || ctx.lastQuery?.freeText || "";
  switch (q.intent) {
    case "greeting":
      return talk(
        'Merhaba! Hangi ilçedesin, ne arıyorsun? Örneğin "Esenler\'de berber" yazabilirsin.',
        [
          { label: "Bugün ne yapsam?", text: "bugün ne yapsam" },
          { label: "Kafe öner", text: "kafe öner" },
          { label: "Yakınımda kafe", text: "yakınımda kafe" },
        ],
      );
    case "thanks":
      return talk(
        "Rica ederim! Başka bir yer ya da kampanya aramak istersen yazman yeter.",
      );
    case "ack":
      return talk(
        "Başka bir yer ya da kampanya aramak istersen yazman yeter.",
        ctx.lastQuery ? [{ label: "Başka öner", text: "başka" }] : [],
      );
    case "dislike": {
      const chips = [];
      if (ctx.lastQuery) chips.push({ label: "Başka öner", text: "başka" });
      chips.push({ label: "Daha uygun fiyatlı", text: "ucuz olan" });
      chips.push({ label: "En yüksek puanlı", text: "en iyi puanlı" });
      chips.push(...topPlaceChips(env.index, label, 2));
      return talk(
        "Anladım. Aramayı nasıl değiştirelim? Başka bir ilçe ya da tür de yazabilirsin.",
        chips,
      );
    }
    default:
      return helpReply(env.index);
  }
}
// ---------- işletme soru-cevap ----------
const ATTR_PHRASE = {
  hours: "saatleri",
  phone: "telefonu",
  address: "adresi",
  rating: "puanı",
  campaign: "kampanyası",
  general: "detay",
};
function mapQuery(b) {
  return [b.name, b.address, b.district, b.city].filter(Boolean).join(" ");
}
function bizShown(b) {
  return { kind: "business", id: b.id, name: b.name };
}
function followChips(b, current) {
  const chips = [];
  // İşletme kartı gösterildiğinde Ara / Yol tarifi düğmeleri kartın altında zaten var
  if (current === "campaign") {
    if (b.phone)
      chips.push({ label: "Ara", action: "call", value: String(b.phone), bizId: b.id });
    chips.push({
      label: "Yol tarifi",
      action: "directions",
      value: mapQuery(b),
      bizId: b.id,
    });
  }
  const more = ["hours", "address", "campaign", "rating"];
  const labels = {
    hours: "Çalışma saatleri",
    address: "Adres",
    campaign: "Kampanyaları",
    rating: "Puanı",
  };
  for (const a of more) {
    if (a !== current)
      chips.push({ label: labels[a], text: `${b.name} ${ATTR_PHRASE[a]}` });
  }
  chips.push({ label: "İşletmeyi aç", action: "openBusiness", value: b.id });
  return chips.slice(0, 6);
}
function ratingLine(b) {
  const c = b.ratingCount || 0;
  const a = b.ratingAvg || 0;
  return c > 0 ? `${a.toFixed(1).replace(".", ",")}/5 (${c} yorum)` : "henüz yorum yok";
}
async function answerAsk(q, ctx, env) {
  const ask = q.ask;
  const { deps } = env;
  // Önceki sonuçlarda olmayan işletme: adıyla ara
  let found;
  if (!ask.target && ask.lookups?.length) {
    let list = [];
    let used = "";
    for (const name of ask.lookups) {
      const res = await safe(
        deps.listBusinesses({
          search: name,
          city: ask.city,
          district: ask.district,
          limit: 6,
        }),
      );
      list = asArray(res);
      if (list.length) {
        used = name;
        break;
      }
    }
    if (list.length === 0) {
      return {
        ...talk(
          `“${ask.lookups[ask.lookups.length - 1]}” adında kayıtlı bir işletme bulamadım. Adını farklı yazarak ya da ilçeyle birlikte deneyebilirsin.`,
          topPlaceChips(env.index, undefined, 3),
        ),
        kind: "ask",
      };
    }
    const exact = list.filter((b) => norm(b.name) === norm(used));
    const pick = list.length === 1 ? list[0] : exact.length === 1 ? exact[0] : undefined;
    if (!pick) {
      return {
        ...talk(
          "Birden fazla işletme buldum, hangisini kastediyorsun?",
          list.slice(0, 4).map((b) => ({
            label: b.name,
            text: `${b.name} ${ATTR_PHRASE[ask.attr]}`,
          })),
        ),
        kind: "ask",
      };
    }
    found = bizShown(pick);
  }
  // Hangisini kastettiği belirsiz: seçenek sun
  if (!ask.target && !found) {
    const list = (ask.candidates || []).slice(0, 4);
    return {
      ...talk(
        "Hangi işletmeyi kastettiğini tam anlayamadım. Birini seçer misin?",
        list.map((it) => ({
          label: it.name,
          text: `${it.name} ${ATTR_PHRASE[ask.attr]}`,
        })),
      ),
      kind: "ask",
    };
  }
  const t = ask.target || found;
  // Kampanya hakkında (genel bilgi / kampanya)
  if (t.kind === "post" && (ask.attr === "general" || ask.attr === "campaign")) {
    const res = await safe(deps.getPost(t.id));
    const p = res?.data;
    if (!p?.id)
      return { ...talk("Bu kampanyanın bilgisine şu an ulaşamadım."), kind: "ask" };
    const hit = toPostHit(p);
    const parts = [p.title];
    if (p.price > 0) parts.push(`${Number(p.price).toLocaleString("tr-TR")}₺`);
    if (hit?.daysLeft != null && hit.daysLeft > 0 && hit.daysLeft <= 30)
      parts.push(hit.daysLeft <= 1 ? "son gün" : `${hit.daysLeft} gün kaldı`);
    const chips = [{ label: "Kampanyayı aç", action: "openPost", value: p.id }];
    if (t.businessId) {
      chips.push({ label: "İşletme telefonu", text: `${t.name} telefonu` });
    }
    return {
      kind: "ask",
      text: parts.join(" · "),
      businesses: [],
      campaigns: hit ? [hit] : [],
      chips,
      shown: [],
      fresh: false,
      focus: t,
    };
  }
  // Diğer sorular işletmeye sorulur
  const bizId = t.kind === "business" ? t.id : t.businessId;
  if (!bizId) {
    return {
      ...talk(
        "Bu kampanyanın hangi işletmeye ait olduğunu bilemiyorum; kampanyayı açıp bakabilirsin.",
        [{ label: "Kampanyayı aç", action: "openPost", value: t.id }],
      ),
      kind: "ask",
    };
  }
  const res = await safe(deps.getBusiness(bizId));
  const b = res?.data;
  if (!b?.id) {
    return {
      ...talk("İşletme bilgisine şu an ulaşamadım. Biraz sonra tekrar dener misin?"),
      kind: "ask",
    };
  }
  const place = [b.district, b.city].filter(Boolean).join(", ");
  const focus = bizShown(b);
  const base = {
    kind: "ask",
    businesses: [{ business: b }],
    campaigns: [],
    shown: [],
    fresh: false,
    focus,
  };
  switch (ask.attr) {
    case "hours": {
      const h = String(b.workingHours || "")
        .trim()
        .slice(0, 400);
      return {
        ...base,
        text: h
          ? `${b.name} çalışma saatleri:\n${h}`
          : `${b.name} çalışma saatlerini henüz eklememiş.${b.phone ? " Arayıp sorabilirsin." : ""}`,
        chips: followChips(b, "hours"),
      };
    }
    case "phone":
      return {
        ...base,
        text: b.phone
          ? `${b.name} telefonu: ${b.phone}`
          : `${b.name} telefon numarası eklememiş. İşletme sayfasından mesaj gönderebilirsin.`,
        chips: followChips(b, "phone"),
      };
    case "address":
      return {
        ...base,
        text: b.address
          ? `${b.name} adresi:\n${b.address}${place ? `\n${place}` : ""}`
          : `${b.name} için tam adres eklenmemiş${place ? `; ${place} bölgesinde kayıtlı` : ""}.`,
        chips: followChips(b, "address"),
      };
    case "rating":
      return {
        ...base,
        text: `${b.name}: ${ratingLine(b)}.`,
        chips: followChips(b, "rating"),
      };
    case "campaign": {
      const pr = await safe(deps.getBusinessPosts(b.id));
      const posts = asArray(pr).map(toPostHit).filter(Boolean);
      const active = posts.slice(0, 3);
      return {
        ...base,
        businesses: [],
        campaigns: active,
        text: active.length
          ? `${b.name} için ${posts.length} aktif kampanya var:`
          : `${b.name} için şu an aktif bir kampanya görünmüyor.`,
        chips: followChips(b, "campaign"),
      };
    }
    default: {
      const desc = String(b.description || "").trim();
      const lines = [
        `${b.name}${b.category?.name ? ` (${b.category.name})` : ""}${place ? ` — ${place}` : ""}`,
        `Puan: ${ratingLine(b)}`,
      ];
      if (desc) lines.push(desc.length > 160 ? `${desc.slice(0, 157)}...` : desc);
      return { ...base, text: lines.join("\n"), chips: followChips(b, "general") };
    }
  }
}
// ---------- arama ----------
async function placesWithResults(q, env, city) {
  const label = q.group?.label || q.freeText;
  if (!label || !city) return [];
  const ids = categoryIdsFor(q, env.categories);
  const terms = searchTermsFor(q);
  const calls = [];
  const base = { city, limit: 50 };
  ids
    .slice(0, 2)
    .forEach((id) =>
      calls.push(safe(env.deps.listBusinesses({ ...base, category: id }))),
    );
  if (!ids.length)
    terms
      .slice(0, 1)
      .forEach((t) => calls.push(safe(env.deps.listBusinesses({ ...base, search: t }))));
  const rows = (await Promise.all(calls)).flatMap(asArray);
  const seen = new Set();
  const counts = new Map();
  rows.forEach((b) => {
    if (!b?.id || seen.has(b.id) || !b.district) return;
    seen.add(b.id);
    counts.set(b.district, (counts.get(b.district) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([district, n]) => ({
      label: seen.size < 50 ? `${district} (${n})` : district,
      text: `${district} ${label}`,
    }));
}
function needLocationReply(q, env) {
  const label = q.group?.label || q.freeText || "";
  return {
    ...talk(
      "Yakınındaki yerleri bulmak için konumuna ihtiyacım var. İzin verirsen en yakın bölgedeki işletme ve kampanyalara bakarım; konumun kaydedilmez. İstersen ilçeni yazman da yeter.",
      [
        { label: "Konumumu kullan", action: "locate", text: q.raw },
        ...topPlaceChips(env.index, label, 3),
      ],
    ),
    kind: "search",
    query: q,
  };
}
async function search(q, ctx, env, more) {
  const { deps } = env;
  const label = q.item || q.group?.label || q.freeText || "";
  const prefix = q.fuzzy
    ? `“${q.fuzzy.from}” yazdığını “${q.fuzzy.to}” olarak anladım. `
    : "";
  let city = q.city;
  let district = q.district;
  let nearNote = "";
  // ---- yakınımda ----
  const useNearby = q.wants.nearby && (!q.district || q.locationFromContext);
  if (useNearby) {
    if (!env.coords) return needLocationReply(q, env);
    const near = await inferPlace(env.coords, q, env);
    if (!near) {
      return {
        ...talk(
          "Konumuna yakın kayıtlı bir kampanya bulamadım. Hangi ilçedesin? Yazarsan oradaki işletmelere bakayım.",
          topPlaceChips(env.index, label, 4),
        ),
        kind: "search",
        query: q,
      };
    }
    city = near.city;
    district = near.district;
    nearNote = ` Konumuna en yakın kayıtlı nokta ${formatKm(near.km)} uzaklıkta; mesafeler yaklaşıktır.`;
  }
  // ---- konum yok: sor ----
  if (!city && !district) {
    const chips = [
      { label: "Konumumu kullan", action: "locate", text: q.raw },
      ...topPlaceChips(env.index, label, 3),
    ];
    return {
      ...talk(
        label
          ? `${cap(label)} için hangi ilçedesin? Yazarsan oradaki işletme ve kampanyalara bakayım.`
          : "Hangi ilçedesin? Yazarsan oradaki işletme ve kampanyalara bakayım.",
        chips,
      ),
      kind: "search",
      query: q,
    };
  }
  const exclude = more ? new Set(ctx.seen || []) : new Set();
  const place = { city, district };
  let scope = { ...place };
  let raw = await fetchRaw(q, env, scope);
  let ranked = rank(raw, q, exclude, env.coords);
  let widened = false;
  const emptyAtScope = ranked.businesses.length === 0 && ranked.campaigns.length === 0;
  // İlçede hiçbir şey yoksa ilin geneline genişlet
  if (emptyAtScope && !more && district && city) {
    scope = { city, district: undefined };
    raw = await fetchRaw(q, env, scope);
    ranked = rank(raw, q, exclude, env.coords);
    widened = ranked.businesses.length > 0 || ranked.campaigns.length > 0;
  }
  const { businesses, campaigns, remaining } = ranked;
  // Bulunamayan arama: yöneticinin görmesi için kaydet
  if (emptyAtScope && !more && label) {
    const full = norm(q.raw).includes(norm(label))
      ? q.raw
      : `${label} ${district || city || ""}`.trim();
    deps.logMiss({ city, district, label, text: full });
  }
  const where = district ? locative(district) : city ? locative(city) : "";
  const listParams = {
    city,
    district: widened ? undefined : district,
    categoryId: raw.categoryIds[0],
    search: raw.categoryIds.length ? undefined : q.group?.terms[0] || q.freeText,
  };
  // ---- hiç sonuç yok ----
  if (businesses.length === 0 && campaigns.length === 0) {
    if (more) {
      return {
        ...talk(
          `${where ? `${cap(where)} ` : ""}bu aramada gösterebileceğim başka kayıt kalmadı. Başka bir tür ya da ilçe deneyebilirsin.`,
          topPlaceChips(env.index, label, 3),
        ),
        kind: "search",
        query: q,
      };
    }
    const chips = await placesWithResults(q, env, city);
    if (chips.length === 0) {
      chips.push({ label: "Kafe öner", text: `${district || city || ""} kafe`.trim() });
      chips.push({
        label: "Restoran öner",
        text: `${district || city || ""} restoran`.trim(),
      });
      if (city) chips.push({ label: `${city} kampanyaları`, text: `${city} kampanya` });
    }
    const note = label
      ? " Aramanı not ettim; sık aranan eksikleri tamamlamaya çalışıyoruz."
      : "";
    return {
      kind: "search",
      text: `${prefix}${cap(where)}${label ? ` ${label} için` : ""} kayıtlı bir işletme ya da kampanya bulamadım.${note}${chips.length ? " Şu seçeneklere bakabilirsin:" : ""}`,
      businesses: [],
      campaigns: [],
      chips,
      place,
      shown: [],
      fresh: !more,
      query: q,
    };
  }
  // ---- sonuç var ----
  const n = businesses.length + campaigns.length;
  const bias = q.wants.expiring
    ? " Süresi en yakın olanları öne aldım."
    : q.wants.cheap
      ? " En uygun fiyatlıları öne aldım."
      : q.wants.best
        ? " En yüksek puanlıları öne aldım."
        : "";
  const locationOnly =
    !label && !q.wants.cheap && !q.wants.best && !q.wants.expiring && !q.wants.discount;
  let text;
  if (q.item) {
    // Ürün / hizmet araması: her sonucun neden listelendiği yazılır
    const lines = businesses.map(
      (h, i) => `${i + 1}) ${h.business.name}${h.why ? ` — ${h.why}` : ""}`,
    );
    const head = more
      ? `İşte ${where} “${q.item}” için başka sonuçlar:`
      : widened
        ? `${prefix}${cap(where)} “${q.item}” için kayıt bulamadım; ${city} genelinde şunları buldum:`
        : useNearby
          ? `${prefix}Konumuna göre ${where} “${q.item}” için sonuçlar, yakından uzağa sıralı:${nearNote}`
          : `${prefix}${cap(where)} “${q.item}” için ${n} sonuç buldum:`;
    const parts = [head];
    if (lines.length) parts.push(lines.join("\n"));
    if (bias) parts.push(bias.trim());
    if (campaigns.length)
      parts.push(
        `${businesses.length ? "Ayrıca " : ""}bu aramaya uyan ${campaigns.length} kampanya aşağıda.`,
      );
    if (businesses.length && !businesses.some((h) => h.itemHit)) {
      parts.push(
        `Bu işletmelerin yazılarında “${q.item}” geçmiyor; türü uygun olduğu için listeledim. Emin olmak için arayıp sorabilirsin.`,
      );
    }
    text = parts.join("\n\n");
  } else if (more) {
    text = `İşte ${where} ${label ? `${label} için ` : ""}başka öneriler:`;
  } else if (widened) {
    text = `${prefix}${cap(where)} ${label || "bu"} için kayıt bulamadım; ${city} genelinde ${n} öneri buldum.${bias}`;
  } else if (useNearby) {
    text = `${prefix}Konumuna göre ${where} ${n} ${label ? `${label} ` : ""}önerisi buldum, yakından uzağa sıraladım.${nearNote}`;
  } else if (locationOnly) {
    text = `${prefix}${cap(where)} kayıtlı en yüksek puanlı işletmelere baktım. Tam olarak ne arıyordun?`;
  } else if (label) {
    text = `${prefix}${cap(where)} senin için ${n} ${label} önerisi buldum.${bias}`;
  } else {
    text = `${prefix}${cap(where)} senin için ${n} öneri buldum.${bias}`;
  }
  const placeText =
    [district, city && !district ? city : ""].filter(Boolean).join(" ") || city || "";
  const chips = [];
  if (remaining > 0) chips.push({ label: "Başka öner", text: "başka" });
  if (locationOnly) {
    // Bölgede bulunan türleri seçenek olarak sun
    const seen = new Set();
    for (const b of raw.businesses) {
      const nm = b.category?.name;
      if (!nm || seen.has(nm)) continue;
      seen.add(nm);
      chips.push({ label: nm, text: `${placeText} ${nm}`.trim() });
      if (seen.size >= 4) break;
    }
  } else {
    if (!q.wants.nearby && !env.coords)
      chips.push({ label: "Yakınımda", text: `yakınımda ${label}`.trim() });
    q.groupCandidates
      .filter((g) => !q.alsoGroups.some((x) => x.key === g.key))
      .slice(0, 1)
      .forEach((g) =>
        chips.push({
          label: `${cap(g.label)} mi?`,
          text: `${placeText} ${g.label}`.trim(),
        }),
      );
    q.alsoGroups
      .slice(0, 1)
      .forEach((g) =>
        chips.push({
          label: `${cap(g.label)} da göster`,
          text: `${placeText} ${g.label}`.trim(),
        }),
      );
    if (!q.wants.cheap) chips.push({ label: "Daha uygun fiyatlı", text: "ucuz olan" });
    if (!q.wants.best) chips.push({ label: "En yüksek puanlı", text: "en iyi puanlı" });
    if (!q.wants.expiring) chips.push({ label: "Bugün bitenler", text: "bugün biten" });
  }
  chips.push({ label: "Hepsini listede gör", action: "list" });
  const shown = [
    ...businesses.map((h) => bizShown(h.business)),
    ...campaigns.map((c) => ({
      kind: "post",
      id: c.id,
      name: c.title,
      businessId: c.businessId,
    })),
  ];
  return {
    kind: "search",
    text,
    businesses,
    campaigns,
    chips: chips.slice(0, 7),
    listParams,
    place: widened ? { city } : place,
    shown,
    fresh: !more,
    query: q,
  };
}
const FOLD = { ç: "c", ğ: "g", ş: "s", ö: "o", ü: "u", â: "a", î: "i", û: "u" };
const fold = (s) =>
  String(s || "")
    .replace(/[İIı]/g, "i")
    .toLowerCase()
    .replace(/[çğşöüâîû]/g, (c) => FOLD[c] || c);
const DAY_NUM = {
  pazartesi: 1,
  pzt: 1,
  pts: 1,
  sali: 2,
  carsamba: 3,
  crs: 3,
  persembe: 4,
  prs: 4,
  cuma: 5,
  cum: 5,
  cumartesi: 6,
  cmt: 6,
  cts: 6,
  pazar: 0,
  paz: 0,
};
const DAY_SRC =
  "pazartesi|pzt|pts|sali|carsamba|crs|persembe|prs|cumartesi|cmt|cts|cuma|cum|pazar|paz";
const GROUP_SRC = "hafta ici|hafta sonu|her ?gun|haftanin her gunu|hergun";
const BOUNDARY_RE = new RegExp(`\\b(?:${GROUP_SRC}|${DAY_SRC})\\b`, "g");
const DAY_RE = new RegExp(`\\b(${DAY_SRC})\\b`, "g");
const TIME_RE = /(\d{1,2})[:.](\d{2})\s*(?:-|–|—|\/|ile|ila|ve)?\s*(\d{1,2})[:.](\d{2})/g;
const HOUR_RE = /(^|[^\d:.])(\d{1,2})\s*[-–—]\s*(\d{1,2})(?![\d:.])/g;
function splitHourSegments(t) {
  const out = [];
  for (const line of t.split(/[\n;|]+/)) {
    // "Hafta içi 09-18, cumartesi 10-14" gibi tek satırı gün başlangıçlarından böl
    let last = 0;
    BOUNDARY_RE.lastIndex = 0;
    let m;
    while ((m = BOUNDARY_RE.exec(line))) {
      const before = line.slice(last, m.index).replace(/\s+$/, "");
      const prev = before.slice(-1);
      const prevBeforeComma = before.slice(-2, -1);
      if (before && (/\d/.test(prev) || (prev === "," && /\d/.test(prevBeforeComma)))) {
        out.push(before);
        last = m.index;
      }
    }
    out.push(line.slice(last));
  }
  return out.map((x) => x.trim()).filter(Boolean);
}
function parseDays(seg) {
  const days = new Set();
  if (/\bhafta ici\b/.test(seg)) [1, 2, 3, 4, 5].forEach((d) => days.add(d));
  if (/\bhafta sonu\b/.test(seg)) [6, 0].forEach((d) => days.add(d));
  if (/\b(her ?gun|hergun|haftanin her gunu)\b/.test(seg))
    [0, 1, 2, 3, 4, 5, 6].forEach((d) => days.add(d));
  const found = [];
  DAY_RE.lastIndex = 0;
  let m;
  while ((m = DAY_RE.exec(seg)))
    found.push({ d: DAY_NUM[m[1]], at: m.index, end: m.index + m[0].length });
  for (let i = 0; i < found.length; i += 1) {
    const cur = found[i];
    const next = found[i + 1];
    const between = next ? seg.slice(cur.end, next.at) : "";
    if (next && /^\s*(-|–|—|ila|ile)\s*$/.test(between)) {
      let d = cur.d;
      days.add(d);
      let guard = 0;
      while (d !== next.d && guard < 8) {
        d = (d + 1) % 7;
        days.add(d);
        guard += 1;
      }
      i += 1;
    } else {
      days.add(cur.d);
    }
  }
  if (days.size === 0) [0, 1, 2, 3, 4, 5, 6].forEach((d) => days.add(d));
  return days;
}
function parseRules(hours) {
  const rules = [];
  for (const seg of splitHourSegments(fold(hours))) {
    const ranges = [];
    TIME_RE.lastIndex = 0;
    let m;
    while ((m = TIME_RE.exec(seg))) {
      const a = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
      let b = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
      if (b === 0) b = 1440;
      if (parseInt(m[1], 10) > 24 || parseInt(m[3], 10) > 24) continue;
      ranges.push([a, b]);
    }
    if (ranges.length === 0) {
      HOUR_RE.lastIndex = 0;
      while ((m = HOUR_RE.exec(seg))) {
        const h1 = parseInt(m[2], 10);
        const h2 = parseInt(m[3], 10);
        if (h1 > 24 || h2 > 24) continue;
        ranges.push([h1 * 60, h2 === 0 ? 1440 : h2 * 60]);
      }
    }
    if (ranges.length > 0) rules.push({ days: parseDays(seg), ranges, closed: false });
    else if (/\bkapali\b/.test(seg))
      rules.push({ days: parseDays(seg), ranges: [], closed: true });
  }
  return rules;
}
export function openState(hours, now) {
  const raw = String(hours || "").trim();
  if (!raw) return "unknown";
  const f = fold(raw);
  if (/(7\s*\/\s*24|24\s*saat|kesintisiz|nonstop)/.test(f) && !/kapali/.test(f))
    return "open";
  const rules = parseRules(raw);
  if (rules.length === 0) return "unknown";
  const day = now.getDay();
  const prev = (day + 6) % 7;
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const r of rules) {
    if (r.closed) continue;
    for (const [a, b] of r.ranges) {
      const overnight = b <= a;
      if (r.days.has(day) && mins >= a && (overnight || mins < b)) return "open";
      if (overnight && r.days.has(prev) && mins < b) return "open";
    }
  }
  return "closed";
}
// ---------- "bugün ne yapsam": isteğe göre işletme seçimi ----------
const normCache = new Map();
const nrm = (w) => {
  let v = normCache.get(w);
  if (v === undefined) {
    v = norm(w);
    normCache.set(w, v);
  }
  return v;
};
// Kelime (ya da kelime öbeği) metinde geçiyor mu? Ek almış hâlleri de yakalar.
function hasWord(tokens, joined, word) {
  const w = nrm(word);
  if (!w) return false;
  if (w.includes(" ")) return ` ${joined} `.includes(` ${w}`);
  return tokens.some((t) => tokenStartsWith(t, w));
}
function planCategoryIds(categories, plan) {
  const words = [...new Set(plan.vibes.flatMap((v) => VIBES[v].cat))]
    .map((w) => nrm(w))
    .filter((w) => w.length >= 3 && !w.includes(" "));
  const ids = [];
  for (const c of categories || []) {
    const toks = norm(c?.name || "").split(" ");
    if (toks.some((t) => words.some((w) => tokenStartsWith(t, w)))) {
      if (c?.id && !ids.includes(c.id)) ids.push(c.id);
    }
  }
  return ids.slice(0, 6);
}
function scorePlan(b, plan, posts, q, now) {
  const catN = norm(b.category?.name || "");
  const catToks = catN.split(" ").filter(Boolean);
  const descN = norm(b.description || "");
  const descToks = descN.split(" ").filter(Boolean);
  const nameN = norm(b.name || "");
  const nameToks = nameN.split(" ").filter(Boolean);
  const textN = `${nameN} ${descN}`.trim();
  const textToks = textN.split(" ").filter(Boolean);
  let relevance = 0;
  let matchedVibes = 0;
  let catHit = false;
  const evidence = [];
  const nameEvidence = [];
  const note = (w) => {
    if (hasWord(descToks, descN, w)) {
      if (!evidence.includes(w)) evidence.push(w);
    } else if (hasWord(nameToks, nameN, w)) {
      if (!nameEvidence.includes(w)) nameEvidence.push(w);
    }
  };
  for (const v of plan.vibes) {
    const def = VIBES[v];
    let vibeScore = 0;
    const cHit = def.cat.some((w) => {
      const nw = nrm(w);
      return nw.includes(" ")
        ? catN.includes(nw)
        : catToks.some((t) => tokenStartsWith(t, nw));
    });
    if (cHit) {
      vibeScore += 3;
      catHit = true;
    }
    let words = 0;
    for (const w of def.text) {
      if (hasWord(textToks, textN, w)) {
        words += 1;
        note(w);
      }
    }
    vibeScore += Math.min(4.5, words * 1.5);
    if (vibeScore > 0) matchedVibes += 1;
    relevance += vibeScore;
    if (def.neg && def.neg.some((w) => hasWord(textToks, textN, w))) relevance -= 2;
  }
  if (matchedVibes === 0 || relevance < 1.5) return null;
  relevance += (matchedVibes - 1) * 2; // birden çok isteğe birden uyan öne çıkar
  if (plan.companion) {
    let hit = 0;
    for (const w of COMPANIONS[plan.companion].text) {
      if (hasWord(textToks, textN, w)) {
        hit += 1;
        note(w);
      }
    }
    relevance += Math.min(2.25, hit * 0.75);
  }
  const count = b.ratingCount || 0;
  const avg = b.ratingAvg || 0;
  const ratingScore = avg * Math.min(1, count / 3);
  const sorter = postSorter(q);
  const campaign = [...posts].sort(sorter)[0];
  const state = openState(b.workingHours, now);
  let score = relevance + ratingScore * (q.wants.best ? 1.2 : 0.6);
  if (campaign) score += q.wants.discount ? 3 : 1.5;
  if (b.isFeatured) score += 0.5;
  if (b.isVerified) score += 0.3;
  if (state === "open") score += 1.5;
  return {
    business: b,
    campaign,
    score,
    relevance,
    evidence,
    nameEvidence,
    catHit,
    matchedVibes,
    state,
  };
}
async function fetchPlanRaw(plan, env, scope) {
  const { deps } = env;
  const ids = planCategoryIds(env.categories, plan);
  const base = { city: scope.city, district: scope.district, limit: 50, detail: 1 };
  const calls = [safe(deps.listBusinesses({ ...base, sort: "rating" }))];
  ids.forEach((id) =>
    calls.push(safe(deps.listBusinesses({ ...base, category: id, sort: "rating" }))),
  );
  const postCall = safe(
    deps.getPosts({
      city: scope.city,
      district: scope.district,
      approved: true,
      limit: 40,
    }),
  );
  const [bizRes, postRes] = await Promise.all([Promise.all(calls), postCall]);
  const bizMap = new Map();
  bizRes.forEach((r) => asArray(r).forEach((b) => b?.id && bizMap.set(b.id, b)));
  const posts = asArray(postRes).map(toPostHit).filter(Boolean);
  return { businesses: [...bizMap.values()], posts, categoryIds: ids };
}
// "yemek de", "doğa da" (ünlü uyumu)
function daDe(word) {
  const low = word.toLocaleLowerCase("tr-TR");
  for (let i = low.length - 1; i >= 0; i -= 1) {
    if ("aıou".includes(low[i])) return "da";
    if ("eiöü".includes(low[i])) return "de";
  }
  return "de";
}
function vibeSentence(plan) {
  const parts = plan.vibes.map((v) => VIBES[v].phrase);
  const who = plan.companion ? COMPANIONS[plan.companion].label : "";
  const what =
    parts.length === 0
      ? ""
      : parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;
  return [who ? cap(who) : "", what].filter(Boolean).join(" ");
}
function planQueryText(placeText, plan, extra) {
  const vibes = extra ? [...plan.vibes, extra] : plan.vibes;
  const words = vibes.map((v) => VIBES[v].say);
  const who = plan.companion ? COMPANIONS[plan.companion].say : "";
  return [placeText, who, ...words, "ne yapsam"].filter(Boolean).join(" ");
}
function planQuestion(q, env) {
  const plan = q.plan;
  const placeText = q.district || q.city || "";
  const lead = placeText ? `${cap(locative(placeText))} ` : "";
  if (plan.companion) {
    const say = COMPANIONS[plan.companion].say;
    const mk = (label, words) => ({
      label,
      text: [placeText, say, words, "ne yapsam"].filter(Boolean).join(" "),
    });
    return {
      ...talk(
        cap(
          `${lead}${COMPANIONS[plan.companion].label} çıkıyorsan nasıl bir yer istersin? Seçebilir ya da kendi cümlenle yazabilirsin; örneğin “sakin, doğayla iç içe bir yer”.`,
        ),
        [
          mk("Sakin ve doğa", "sakin doğa"),
          mk("Yemek", "yemek"),
          mk("Kahve ve tatlı", "kahve tatlı"),
          mk("Eğlence", "eğlenceli"),
          mk("Bakım ve rahatlama", "rahatlamak bakım"),
        ],
      ),
      kind: "search",
      query: q,
      place: q.city || q.district ? { city: q.city, district: q.district } : undefined,
    };
  }
  const mk = (label, words) => ({
    label,
    text: [placeText, words].filter(Boolean).join(" "),
  });
  return {
    ...talk(
      cap(
        `${lead}sana bizdeki işletmelerden uygun yerler seçeyim. Kiminle çıkıyorsun, nasıl bir yer istersin? Örneğin “ailemle sakin bir yerde doğa ile gezinti” ya da “arkadaşlarımla eğlenceli bir yer” yazabilirsin.`,
      ),
      [
        mk("Ailemle sakin ve doğa", "ailemle sakin bir yerde doğa ile gezinti"),
        mk("Sevgilimle romantik", "sevgilimle sakin romantik bir yerde yemek"),
        mk("Arkadaşlarımla eğlence", "arkadaşlarımla eğlenceli bir yer"),
        mk("Kahve ve sohbet", "tek başıma sakin kahve ve sohbet"),
        mk("Bakım ve rahatlama", "rahatlamak istiyorum bakım"),
      ],
    ),
    kind: "search",
    query: q,
    place: q.city || q.district ? { city: q.city, district: q.district } : undefined,
  };
}
async function planReply(q, ctx, env, more) {
  const plan = q.plan;
  if (plan.vibes.length === 0) return planQuestion(q, env);
  const now = env.now ? env.now() : new Date();
  const summary = vibeSentence(plan);
  const planLabel = planQueryText("", plan); // düğme metinlerinde ilçeden önce/sonra kullanılır
  let city = q.city;
  let district = q.district;
  let nearNote = "";
  const useNearby = q.wants.nearby && (!q.district || q.locationFromContext);
  if (useNearby) {
    if (!env.coords) return needLocationReply(q, env);
    const near = await inferPlace(env.coords, q, env);
    if (!near) {
      return {
        ...talk(
          "Konumuna yakın kayıtlı bir kampanya bulamadım. Hangi ilçedesin? Yazarsan oradaki işletmelere bakayım.",
          topPlaceChips(env.index, planLabel, 4),
        ),
        kind: "search",
        query: q,
      };
    }
    city = near.city;
    district = near.district;
    nearNote = ` Konumuna en yakın kayıtlı nokta ${formatKm(near.km)} uzaklıkta.`;
  }
  if (!city && !district) {
    return {
      ...talk(`${summary} için hangi ilçedesin? Yazarsan oradaki işletmelere bakayım.`, [
        { label: "Konumumu kullan", action: "locate", text: q.raw },
        ...topPlaceChips(env.index, planLabel, 3),
      ]),
      kind: "search",
      query: q,
    };
  }
  const exclude = more ? new Set(ctx.seen || []) : new Set();
  const place = { city, district };
  const pick = (raw) => {
    const byBiz = new Map();
    raw.posts.forEach((p) => {
      if (!p.businessId) return;
      const arr = byBiz.get(p.businessId) || [];
      arr.push(p);
      byBiz.set(p.businessId, arr);
    });
    const all = raw.businesses
      .filter((b) => !exclude.has(b.id))
      .map((b) => scorePlan(b, plan, byBiz.get(b.id) || [], q, now))
      .filter(Boolean);
    all.sort((a, b) => b.score - a.score);
    // Şu an kapalı olduğu anlaşılanlar yalnızca başka seçenek yoksa gösterilir
    const usable = all.filter((s) => s.state !== "closed");
    const list =
      usable.length >= 2
        ? usable
        : [...usable, ...all.filter((s) => s.state === "closed")];
    return list;
  };
  let raw = await fetchPlanRaw(plan, env, place);
  let list = pick(raw);
  let widened = false;
  if (list.length === 0 && !more && district && city) {
    raw = await fetchPlanRaw(plan, env, { city });
    list = pick(raw);
    widened = list.length > 0;
  }
  const where = district ? locative(district) : city ? locative(city) : "";
  const placeText = district || city || "";
  if (list.length === 0) {
    if (more) {
      return {
        ...talk(
          `${where ? `${cap(where)} ` : ""}bu istek için gösterebileceğim başka kayıt kalmadı. Başka bir ilçe ya da farklı bir istek deneyebilirsin.`,
          topPlaceChips(env.index, planLabel, 3),
        ),
        kind: "search",
        query: q,
      };
    }
    env.deps.logMiss({
      city,
      district,
      label: [
        plan.companion ? COMPANIONS[plan.companion].say : "",
        ...plan.vibes.map((v) => VIBES[v].say),
      ]
        .filter(Boolean)
        .join(" "),
      text: q.raw,
    });
    const alt = ["sakin", "doga", "yemek", "kahve", "eglence", "bakim"]
      .filter((v) => !plan.vibes.includes(v))
      .slice(0, 3);
    const chips = alt.map((v) => ({
      label: `${cap(VIBES[v].say)} ${daDe(VIBES[v].say)} olsun`,
      text: planQueryText(placeText, { companion: plan.companion, vibes: [] }, v),
    }));
    chips.push(...topPlaceChips(env.index, planLabel, 2));
    return {
      kind: "search",
      text: `${cap(where)} ${summary.toLocaleLowerCase("tr-TR")} bir yer için kayıtlı uygun bir işletme bulamadım; işletmelerin açıklamasında ve kategorilerinde bu isteğe uyan bir şey yok. Aramanı not ettim, eksikleri tamamlamaya çalışıyoruz. İstersen isteği biraz değiştirelim:`,
      businesses: [],
      campaigns: [],
      chips,
      place,
      shown: [],
      fresh: !more,
      query: q,
    };
  }
  const top = list.slice(0, 3);
  const remaining = Math.max(0, list.length - top.length);
  const businesses = top.map((s) => ({ business: s.business, campaign: s.campaign }));
  const lines = top.map((s, i) => {
    const b = s.business;
    const bits = [];
    if (widened && b.district) bits.push(b.district);
    // "huzur" ve "huzurlu" gibi birbirinin kökü olan kelimelerden yalnızca kısası gösterilir
    const quote = (arr) =>
      arr
        .filter((x) => !arr.some((y) => y !== x && nrm(x).startsWith(nrm(y))))
        .slice(0, 3)
        .map((x) => `“${x}”`)
        .join(", ");
    if (s.evidence.length > 0) bits.push(`açıklamasında ${quote(s.evidence)} geçiyor`);
    if (s.nameEvidence.length > 0) bits.push(`adında ${quote(s.nameEvidence)} geçiyor`);
    if (s.catHit && b.category?.name) bits.push(`kategorisi ${b.category.name}`);
    if ((b.ratingCount || 0) > 0) bits.push(ratingLine(b));
    if (s.state === "open") bits.push("şu an açık");
    else if (s.state === "closed") bits.push("şu an kapalı");
    if (s.campaign) bits.push("kampanyası var");
    return `${i + 1}) ${b.name} — ${bits.join(" · ")}`;
  });
  const intro = more
    ? `İşte ${summary.toLocaleLowerCase("tr-TR")} bir çıkış için başka öneriler:`
    : widened
      ? `${cap(where)} bu isteğe uygun kayıt bulamadım; ${city} genelinde ${top.length} öneri buldum (${summary.toLocaleLowerCase("tr-TR")}).`
      : `${cap(summary)} bir çıkış için ${where} ${top.length} öneri buldum.${nearNote}`;
  const foot = more
    ? ""
    : "\n\nYerleri işletmelerin kendi yazdığı açıklama, kategori, puan ve kampanya bilgisine göre seçtim; açık olduğu anlaşılanlar öne alındı.";
  const text = `${intro}\n\n${lines.join("\n")}${foot}`;
  const chips = [];
  if (remaining > 0) chips.push({ label: "Başka öner", text: "başka" });
  ["yemek", "kahve", "eglence", "doga", "sakin", "bakim"]
    .filter((v) => !plan.vibes.includes(v))
    .slice(0, 2)
    .forEach((v) =>
      chips.push({
        label: `${cap(VIBES[v].say)} ${daDe(VIBES[v].say)} olsun`,
        text: planQueryText(placeText, plan, v),
      }),
    );
  if (!q.wants.nearby && !env.coords)
    chips.push({ label: "Yakınımda", text: `yakınımda ${planLabel}` });
  chips.push({ label: "Hepsini listede gör", action: "list" });
  const shown = top.map((s) => bizShown(s.business));
  return {
    kind: "search",
    text,
    businesses,
    campaigns: [],
    chips: chips.slice(0, 7),
    listParams: { city, district: widened ? undefined : district },
    place: widened ? { city } : place,
    shown,
    fresh: !more,
    query: q,
  };
}
// ---------- giriş noktası ----------
export async function respond(q, ctx, env) {
  switch (q.intent) {
    case "greeting":
    case "thanks":
    case "ack":
    case "dislike":
    case "help":
      return smallTalk(q, ctx, env);
    case "ask":
      return answerAsk(q, ctx, env);
    case "plan":
      return planReply(q, ctx, env, false);
    case "more": {
      const last = ctx.lastQuery;
      if (!last) return helpReply(env.index);
      if (last.plan)
        return planReply(
          { ...last, intent: "plan", more: true, fuzzy: undefined },
          ctx,
          env,
          true,
        );
      return search(
        { ...last, intent: "search", more: true, fuzzy: undefined },
        ctx,
        env,
        true,
      );
    }
    default:
      return search(q, ctx, env, false);
  }
}
// Cevaptan sonra sohbet bağlamını günceller
export function nextContext(ctx, r) {
  if (r.kind === "talk") return ctx;
  if (r.kind === "ask") return { ...ctx, focus: r.focus ?? ctx.focus };
  const q = r.query;
  const ids = [
    ...r.businesses.map((b) => b.business.id),
    ...r.campaigns.map((c) => c.id),
    ...r.businesses.map((b) => b.campaign?.id).filter(Boolean),
  ];
  const empty = r.businesses.length === 0 && r.campaigns.length === 0;
  const next = { ...ctx };
  if (r.place) {
    next.city = r.place.city;
    next.district = r.place.district;
  }
  if (q?.group) next.groupKey = q.group.key;
  else if (q?.freeText || q?.plan) next.groupKey = undefined;
  if (!empty) {
    next.shown = r.shown;
    next.seen = r.fresh ? ids : [...(ctx.seen || []), ...ids];
    next.lastQuery = q;
    next.focus = undefined;
  } else if (q && !q.more) {
    // sonuçsuz yeni aramada eski öneriler geçersiz, ama konum/tür hatırlanır
    next.lastQuery = q;
  }
  return next;
}
