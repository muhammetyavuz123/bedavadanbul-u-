import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiList,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiSend,
  FiStar,
  FiTag,
  FiZap,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BizAvatar from "../../components/BizAvatar/BizAvatar";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import defaultImage from "../../assets/r.png";
import apiRequest from "../../lib/apiRequest";
import { cityPath, districtPath } from "../../lib/slug";
import { parseQuery } from "../../lib/assistant/nlu";
import { formatKm, nextContext, respond } from "../../lib/assistant/recommend";
import "./assistantPage.scss";

// BedavadanBul Asistan (web). Yapay zekâ servisi kullanmaz: yazılanı kendi
// anlama katmanımızla (lib/assistant) çözer ve yalnızca sitedeki gerçek
// işletme ve kampanyalardan öneri sunar. Mobil uygulamadaki asistanla aynı mantık.

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: 'Merhaba! Ben BedavadanBul asistanıyım. Bulunduğun ilçeyi ve ne aradığını yaz, sitedeki gerçek işletme ve kampanyalardan sana öneririm. Önerdiklerim hakkında telefon, adres, çalışma saati de sorabilirsin.\n\nÖrneğin: "Bayrampaşa\'dayım, bir kafe önerir misin?"',
  chips: [
    { label: "Bugün ne yapsam?", text: "bugün ne yapsam" },
    { label: "Kafe öner", text: "kafe öner" },
    { label: "Yakınımda restoran", text: "yakınımda restoran" },
    { label: "Bugün biten kampanyalar", text: "bugün biten kampanyalar" },
  ],
};

// Öneri motoruna verilen ağ işlemleri (motor platformdan bağımsız)
const deps = {
  listBusinesses: (params) => apiRequest.get("/businesses", { params }),
  getBusiness: (id) => apiRequest.get(`/businesses/${id}`),
  getBusinessPosts: (id) => apiRequest.get(`/businesses/${id}/posts`),
  getPosts: (params) => apiRequest.get("/posts", { params }),
  getPost: (id) => apiRequest.get(`/posts/${id}`),
  // Bulunamayan arama: isimsiz kaydedilir, hata kullanıcıya yansımaz
  logMiss: (m) => {
    apiRequest.post("/assistant/miss", m).catch(() => {});
  },
};

const telHref = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("90")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+9${digits}`;
  return `tel:+90${digits}`;
};

const mapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const track = (id, type) => {
  if (id) apiRequest.post(`/businesses/${id}/track`, { type }).catch(() => {});
};

const readCoords = () =>
  new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation)
      return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000 },
    );
  });

// İzin daha önce verildiyse sormadan konumu al
const readCoordsIfGranted = async () => {
  try {
    const st = await navigator.permissions?.query({ name: "geolocation" });
    if (st?.state === "granted") return await readCoords();
  } catch {
    /* tarayıcı desteklemiyor */
  }
  return null;
};

// İl/ilçe listesi: işletmesi olan yerler (sayılarıyla) + İstanbul ilçeleri
async function buildIndex() {
  const get = (url) => apiRequest.get(url).catch(() => null);
  const [prov, places, ist, cats] = await Promise.all([
    get("/locations"),
    get("/businesses/places"),
    get(`/locations/${encodeURIComponent("İstanbul")}`),
    get("/categories"),
  ]);

  const cities = new Set();
  (prov?.data ?? []).forEach((i) => {
    const n = i?.il_adi ?? i;
    if (typeof n === "string") cities.add(n);
  });

  const districts = [];
  const seen = new Set();
  (places?.data ?? []).forEach((c) => {
    if (c?.city) cities.add(c.city);
    (c?.districts ?? []).forEach((d) => {
      if (!d?.district || !c?.city) return;
      const key = `${c.city}|${d.district}`;
      if (seen.has(key)) return;
      seen.add(key);
      districts.push({
        district: d.district,
        city: c.city,
        count: d.count || 0,
      });
    });
  });
  (ist?.data ?? []).forEach((x) => {
    const n = x?.ilce_adi ?? x;
    if (typeof n !== "string") return;
    const key = `İstanbul|${n}`;
    if (seen.has(key)) return;
    seen.add(key);
    districts.push({ district: n, city: "İstanbul", count: 0 });
  });

  return {
    index: {
      cities: [...cities],
      districts,
      categories: Array.isArray(cats?.data) ? cats.data : [],
    },
    categories: Array.isArray(cats?.data) ? cats.data : [],
  };
}

const daysText = (d) =>
  d === null ? "" : d <= 1 ? "Son gün" : `${d} gün kaldı`;

function Stars({ value }) {
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} className={n <= Math.round(value) ? "on" : ""} />
      ))}
    </span>
  );
}

function BusinessResult({ business, distanceKm }) {
  const count = business.ratingCount || 0;
  const avg = business.ratingAvg || 0;
  const place = [business.district, business.city].filter(Boolean).join(", ");
  return (
    <Link to={`/isletme/${business.id}`} className="asBiz">
      <span className="asBizAvatar">
        <BizAvatar name={business.name} logo={business.logo} />
      </span>
      <span className="asBizBody">
        <strong>{business.name}</strong>
        {business.category?.name && <em>{business.category.name}</em>}
        <span className="asBizRating">
          <Stars value={avg} />
          {count > 0 ? `${avg.toFixed(1)} (${count} yorum)` : "Henüz yorum yok"}
        </span>
        {place && <small>{place}</small>}
        {distanceKm != null && (
          <small className="asDist">~{formatKm(distanceKm)} uzakta</small>
        )}
      </span>
      <FiArrowRight className="asGo" />
    </Link>
  );
}

function QuickActions({ business }) {
  const query = [
    business.name,
    business.address,
    business.district,
    business.city,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="asQuick">
      {business.phone && (
        <a
          href={telHref(business.phone)}
          onClick={() => track(business.id, "call")}
          className="asQuickBtn"
        >
          <FiPhone /> Ara
        </a>
      )}
      <a
        href={mapsUrl(query)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(business.id, "directions")}
        className="asQuickBtn"
      >
        <FiNavigation /> Yol tarifi
      </a>
    </div>
  );
}

function CampaignResult({ item }) {
  const place = [item.district, item.city].filter(Boolean).join(", ");
  const urgent = item.daysLeft !== null && item.daysLeft <= 3;
  return (
    <Link to={`/${item.id}`} className="asCamp">
      <img src={item.images?.[0] || defaultImage} alt="" loading="lazy" />
      <span className="asCampBody">
        <span className="asTag">
          <FiTag /> Kampanya
        </span>
        <strong>{item.title}</strong>
        {place && <small>{place}</small>}
        <span className="asCampMeta">
          {item.price > 0 && (
            <b className="asPrice">{item.price.toLocaleString("tr-TR")}₺</b>
          )}
          {item.daysLeft !== null &&
            item.daysLeft > 0 &&
            item.daysLeft <= 30 && (
              <b className={`asDays${urgent ? " urgent" : ""}`}>
                {daysText(item.daysLeft)}
              </b>
            )}
        </span>
      </span>
      <FiArrowRight className="asGo" />
    </Link>
  );
}

function AssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const listRef = useRef(null);
  const ctx = useRef({});
  const idx = useRef(null);
  const idxPromise = useRef(null);
  const counter = useRef(0);
  const coordsRef = useRef(null);

  const ensureIndex = useCallback(() => {
    if (idx.current) return Promise.resolve();
    if (!idxPromise.current) {
      idxPromise.current = buildIndex().then((r) => {
        idx.current = r;
      });
    }
    return idxPromise.current;
  }, []);

  useEffect(() => {
    ensureIndex();
  }, [ensureIndex]);

  // Yeni mesajda sohbet kutusunu kaydır (sayfayı değil). Asistanın cevabı
  // geldiğinde cevabın BAŞI görünsün; yazıyor göstergesi/kullanıcı mesajında en alta in.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const last = el.lastElementChild;
    const isBotReply = last && last.classList.contains("bot") && !typing;
    const top = isBotReply ? Math.max(0, last.offsetTop - 12) : el.scrollHeight;
    el.scrollTo({ top, behavior: "smooth" });
  }, [messages, typing]);

  const push = useCallback((m) => {
    counter.current += 1;
    setMessages((prev) => [...prev, { ...m, id: `m${counter.current}` }]);
  }, []);

  const send = useCallback(
    async (raw, display) => {
      const text = String(raw || "")
        .trim()
        .slice(0, 200);
      if (!text || typing) return;
      setInput("");
      push({ role: "user", text: display || text });
      setTyping(true);
      try {
        await ensureIndex();
        const { index, categories } = idx.current || {
          index: { cities: [], districts: [] },
          categories: [],
        };
        const q = parseQuery(text, index, ctx.current);

        // "Yakınımda": izin daha önce verildiyse konumu sessizce al
        if (q.wants.nearby && !coordsRef.current) {
          coordsRef.current = await readCoordsIfGranted();
        }

        const r = await respond(q, ctx.current, {
          categories,
          index,
          deps,
          coords: coordsRef.current,
        });
        // Konuşmanın devamı için konumu, türü ve gösterilenleri hatırla
        ctx.current = nextContext(ctx.current, r);
        push({
          role: "bot",
          text: r.text,
          businesses: r.businesses,
          campaigns: r.campaigns,
          chips: r.chips,
          listParams: r.listParams,
        });
      } catch {
        push({
          role: "bot",
          text: "Şu an bağlanamadım. İnternet bağlantını kontrol edip tekrar dener misin?",
        });
      } finally {
        setTyping(false);
      }
    },
    [ensureIndex, push, typing],
  );

  const onChip = async (chip, msg) => {
    switch (chip.action) {
      case "list": {
        const p = msg.listParams || {};
        const qs = new URLSearchParams();
        if (p.city) qs.set("city", p.city);
        if (p.district) qs.set("district", p.district);
        if (p.categoryId) qs.set("categoryId", p.categoryId);
        if (p.search) qs.set("search", p.search);
        navigate(`/list?${qs.toString()}`);
        return;
      }
      case "call":
        if (chip.value) {
          track(chip.bizId, "call");
          window.location.href = telHref(chip.value);
        }
        return;
      case "directions":
        if (chip.value) {
          track(chip.bizId, "directions");
          window.open(mapsUrl(chip.value), "_blank", "noopener,noreferrer");
        }
        return;
      case "openBusiness":
        if (chip.value) navigate(`/isletme/${chip.value}`);
        return;
      case "openPost":
        if (chip.value) navigate(`/${chip.value}`);
        return;
      case "locate": {
        const co = await readCoords();
        if (!co) {
          push({ role: "user", text: chip.label });
          push({
            role: "bot",
            text: "Konum izni verilmedi, sorun değil. Hangi ilçedesin? İlçeni yazman yeter.",
          });
          return;
        }
        coordsRef.current = co;
        send(chip.text || "yakınımda", chip.label);
        return;
      }
      default:
        send(chip.text || chip.label);
    }
  };

  const lastId = messages[messages.length - 1]?.id;

  // Sonuç altındaki "bu bölgedeki tüm işletmeler" bağlantısı
  const moreLink = (msg) => {
    const p = msg.listParams;
    if (!msg.businesses?.length || !p?.city) return null;
    return p.district ? districtPath(p.city, p.district) : cityPath(p.city);
  };

  return (
    <>
      <Helmet>
        <title>Asistan | BedavadanBul.com</title>
        <meta
          name="description"
          content="BedavadanBul asistanına bulunduğun ilçeyi ve aradığın yeri yaz; sana uygun işletme ve kampanyaları önersin."
        />
      </Helmet>

      <Breadcrumb
        title="Asistan"
        breadcrumbText="Anasayfa / Asistan"
        backgroundImage={BreadcrumbImage}
      />

      <div className="assistantPage">
        <div className="asCard">
          <header className="asHead">
            <span className="asHeadIcon">
              <FiZap />
            </span>
            <div>
              <h1>BedavadanBul Asistan</h1>
              <p>Sadece sitedeki gerçek işletme ve kampanyalardan önerir</p>
            </div>
          </header>

          <div className="asList" ref={listRef} role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`asMsg ${m.role}`}>
                <div className="asBubble">{m.text}</div>

                {m.businesses?.map((h) => (
                  <div key={h.business.id} className="asResult">
                    <BusinessResult
                      business={h.business}
                      distanceKm={h.distanceKm}
                    />
                    <QuickActions business={h.business} />
                    {h.campaign && <CampaignResult item={h.campaign} />}
                  </div>
                ))}

                {m.campaigns?.map((c) => (
                  <div key={c.id} className="asResult">
                    <CampaignResult item={c} />
                  </div>
                ))}

                {m.id === lastId && moreLink(m) && !typing && (
                  <Link to={moreLink(m)} className="asMore">
                    Bu bölgedeki tüm işletmeleri gör <FiArrowRight />
                  </Link>
                )}

                {m.id === lastId && m.chips?.length > 0 && !typing && (
                  <div className="asChips">
                    {m.chips.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => onChip(c, m)}
                      >
                        {c.action === "list" && <FiList />}
                        {c.action === "locate" && <FiMapPin />}
                        {c.action === "call" && <FiPhone />}
                        {c.action === "directions" && <FiNavigation />}
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="asMsg bot">
                <div className="asBubble typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>

          <form
            className="asInput"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Örn: Bayrampaşa'dayım, kafe öner"
              maxLength={200}
              aria-label="Asistana mesaj yaz"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Gönder"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AssistantPage;
