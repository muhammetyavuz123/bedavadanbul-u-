import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiLock,
  FiMapPin,
  FiSearch,
  FiMessageCircle,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import StarRating from "../StarRating/StarRating";
import BizAvatar from "../BizAvatar/BizAvatar";
import apiRequest from "../../lib/apiRequest";
import { useCategories } from "../../lib/useCategories";
import { AuthContext } from "../../context/AuthContext";
import { cityPath } from "../../lib/slug";
import { VerifiedBadge } from "../BizBadges/BizBadges";
import "./businessShowcase.scss";

const STEPS = [
  { icon: FiSearch, title: "Bul", text: "Şehir, kategori ve puana göre filtrele." },
  { icon: FiMessageCircle, title: "Sor", text: "Fiyatı işletmeye özel yaz, yanıt gelsin." },
  { icon: FiStar, title: "Karar ver", text: "Gerçek müşteri yorumlarına bak." },
];

// Telefon içindeki örnek konuşma: [kimden, metin]
const CHAT = [
  ["me", "Merhaba, kanal tedavisi için fiyat alabilir miyim?"],
  ["biz", "Merhaba! Muayene sonrası net fiyatı paylaşıyoruz. Bu hafta randevu açabilir miyiz?"],
  ["me", "Olur, çok teşekkürler."],
];

function useChatStep() {
  // 0: boş, 1: ilk mesaj, 2: yazıyor..., 3: yanıt, 4: son mesaj → bekle → başa dön
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStep(4);
      return undefined;
    }
    const delays = [900, 1100, 1500, 1500, 3800]; // her adımdan sonra bekleme
    let timer;
    let current = 0;
    const tick = () => {
      current = (current + 1) % 5;
      setStep(current);
      timer = setTimeout(tick, delays[current]);
    };
    timer = setTimeout(tick, delays[0]);
    return () => clearTimeout(timer);
  }, []);

  return step;
}

function BusinessShowcase() {
  const { currentUser } = useContext(AuthContext);
  const categories = useCategories();
  const step = useChatStep();
  const [items, setItems] = useState([]);
  const [localCity, setLocalCity] = useState("");

  // Giriş yapmış kullanıcının şehrindeki işletmeler öne alınır (en az 3 sonuç varsa);
  // yoksa genel "en çok beğenilenler". Öne çıkan işletmeleri API zaten en üste koyar.
  const userCity = currentUser?.city || "";
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (userCity) {
          const local = await apiRequest.get(
            `/businesses?limit=8&sort=rating&city=${encodeURIComponent(userCity)}`,
          );
          const list = local.data?.data || [];
          if (list.length >= 3) {
            if (!cancelled) {
              setItems(list);
              setLocalCity(userCity);
            }
            return;
          }
        }
        const res = await apiRequest.get("/businesses?limit=8&sort=rating");
        if (!cancelled) {
          setItems(res.data?.data || []);
          setLocalCity("");
        }
      } catch {
        /* vitrin yüklenmezse bölüm yine de tanıtımla görünür */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userCity]);

  const isBusiness = currentUser?.role === "business";
  const isGuest = !currentUser;
  const quickCats = categories.filter((c) => !c.parentId).slice(0, 6);
  const floaters = items.slice(0, 2);

  return (
    <section className="bizShowcase">
      <div className="bizShowcasePanel">
        <div className="blob blobA" />
        <div className="blob blobB" />

        <div className="bizShowcaseIntro">
          <span className="kicker">İşletme Rehberi</span>
          <h2>
            Yakınındaki işletmeler,
            <br />
            <span className="grad">bir mesaj uzağında</span>
          </h2>
          <p>
            Diş kliniğinden kuaföre, tesisatçıdan oto servise kadar işletmeleri keşfet. Fiyatı
            herkesin önünde değil, işletmeye özel sor.
          </p>

          <ol className="bizSteps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <span className="stepNo">{i + 1}</span>
                <span className="stepBody">
                  <strong>
                    <Icon /> {title}
                  </strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ol>

          {quickCats.length > 0 && (
            <div className="bizQuickCats">
              {quickCats.map((c) => (
                <Link key={c.id} to={`/isletmeler?category=${c.id}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="bizIntroActions">
            <Link to="/isletmeler" className="bizBtn primary">
              İşletmeleri Keşfet <FiArrowRight />
            </Link>
            <span className="privateNote">
              <FiLock /> Sorular gizlidir
            </span>
          </div>
        </div>

        {/* ===== Telefon: örnek özel konuşma ===== */}
        <div className="bizStage" aria-hidden="true">
          <div className="phone">
            <div className="phoneNotch" />
            <div className="phoneHead">
              <span className="phoneAvatar">
                <FiBriefcase />
              </span>
              <span className="phoneTitle">
                <strong>Örnek İşletme</strong>
                <small>Özel yazışma</small>
              </span>
              <FiLock className="phoneLock" />
            </div>

            <div className="phoneBody">
              {CHAT.map(([from, text], i) => {
                // CHAT[0] adım 1'de, CHAT[1] adım 3'te, CHAT[2] adım 4'te görünür
                const showAt = [1, 3, 4][i];
                return (
                  <div key={text} className={`bubble ${from} ${step >= showAt ? "in" : ""}`}>
                    {text}
                  </div>
                );
              })}
              <div className={`bubble biz typing ${step === 2 ? "in" : ""}`}>
                <i />
                <i />
                <i />
              </div>
            </div>
            <span className="phoneTag">Örnek görüntü</span>
          </div>

          {floaters[0] && (
            <Link to={`/isletme/${floaters[0].id}`} className="floater fa" tabIndex={-1}>
              <span className="fLogo">
                <BizAvatar name={floaters[0].name} logo={floaters[0].logo} alt="" />
              </span>
              <span>
                <strong>{floaters[0].name}</strong>
                <small>
                  <FiMapPin /> {floaters[0].city}
                </small>
              </span>
            </Link>
          )}
          {floaters[1] ? (
            <Link to={`/isletme/${floaters[1].id}`} className="floater fb" tabIndex={-1}>
              <span className="fLogo">
                <BizAvatar name={floaters[1].name} logo={floaters[1].logo} alt="" />
              </span>
              <span>
                <strong>{floaters[1].name}</strong>
                <small>
                  <FiMapPin /> {floaters[1].city}
                </small>
              </span>
            </Link>
          ) : (
            <div className="floater fb static">
              <span className="fLogo">
                <FiStar />
              </span>
              <span>
                <strong>Gerçek yorumlar</strong>
                <small>Puanla, yorumla</small>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== Yatay kayan işletme vitrini ===== */}
      {items.length > 0 && (
        <div className="bizRailWrap">
          <div className="bizRailHead">
            <h3>{localCity ? `${localCity} bölgesinde öne çıkanlar` : "En çok beğenilenler"}</h3>
            <Link to={localCity ? `${cityPath(localCity)}?sort=rating` : "/isletmeler?sort=rating"}>
              Tümünü Gör <FiArrowRight />
            </Link>
          </div>
          <div className="bizRail">
            {items.map((b, i) => (
              <Link key={b.id} to={`/isletme/${b.id}`} className="railCard">
                <div className="railTop">
                  <div className="railLogo">
                    <BizAvatar name={b.name} logo={b.logo} />
                  </div>
                  {b.ratingCount > 0 ? (
                    <span className="railScore">★ {b.ratingAvg.toFixed(1)}</span>
                  ) : (
                    <span className="railScore new">Yeni</span>
                  )}
                </div>
                <strong className="railName">
                  {b.name} {b.isVerified && <VerifiedBadge compact />}
                </strong>
                {b.category?.name && <span className="railCat">{b.category.name}</span>}
                <div className="railRating">
                  <StarRating value={b.ratingAvg} size={13} />
                  <span>{b.ratingCount > 0 ? `${b.ratingCount} yorum` : "Henüz yorum yok"}</span>
                </div>
                <span className="railPlace">
                  <FiMapPin /> {b.district}, {b.city}
                </span>
                <span className="railGo">
                  Profili Gör <FiArrowRight />
                </span>
                {b.isFeatured ? (
                  <span className="railCrown">Öne çıkan</span>
                ) : (
                  i === 0 &&
                  b.ratingCount > 0 && <span className="railCrown">En yüksek puan</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(isGuest || isBusiness) && (
        <div className="bizCta">
          <div className="bizCtaText">
            <span className="kicker light">İşletme sahipleri için</span>
            <h3>Müşterilerin seni burada arıyor</h3>
            <ul>
              <li>
                <FiCheckCircle /> Ücretsiz işletme profili aç
              </li>
              <li>
                <FiCheckCircle /> Gelen soruları panelden yanıtla, müşteri kazan
              </li>
              <li>
                <FiTrendingUp /> Yorumlarla güven oluştur
              </li>
            </ul>
          </div>
          {isBusiness ? (
            <Link to="/profile?tab=business" className="bizBtn light">
              İşletme Panelime Git <FiArrowRight />
            </Link>
          ) : (
            <Link to="/register?type=business" className="bizBtn light">
              Ücretsiz İşletme Profili Aç <FiArrowRight />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export default BusinessShowcase;
