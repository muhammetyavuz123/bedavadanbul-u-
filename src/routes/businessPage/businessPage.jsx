import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiClock,
  FiGlobe,
  FiMessageCircle,
  FiBriefcase,
  FiTrash2,
  FiShare2,
  FiNavigation,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiEdit3,
  FiMaximize2,
  FiZap,
  FiCalendar,
  FiStar,
  FiArrowRight,
  FiHeart,
  FiTag,
  FiCornerDownRight,
} from "react-icons/fi";
import Loader from "../../components/loader/Loader";
import StarRating from "../../components/StarRating/StarRating";
import BizAvatar from "../../components/BizAvatar/BizAvatar";
import { VerifiedBadge, FeaturedBadge } from "../../components/BizBadges/BizBadges";
import apiRequest from "../../lib/apiRequest";
import { bizTheme } from "../../lib/bizTheme";
import { cityPath, districtPath } from "../../lib/slug";
import { AuthContext } from "../../context/AuthContext";
import { formatPhone, telHref, formatDateTime } from "../../lib/formatPhone";
import "./businessPage.scss";

// Müşterinin tek tıkla başlatabileceği hazır sorular
const QUICK_QUESTIONS = [
  {
    label: "Fiyat bilgisi",
    subject: "Fiyat bilgisi",
    message: "Merhaba, hizmetleriniz için fiyat bilgisi alabilir miyim?",
  },
  {
    label: "Randevu",
    subject: "Randevu",
    message: "Merhaba, bu hafta için randevunuz müsait mi?",
  },
  {
    label: "Çalışma saatleri",
    subject: "Çalışma saatleri",
    message: "Merhaba, çalışma saatleriniz ve adresiniz hakkında bilgi alabilir miyim?",
  },
  {
    label: "Kampanya var mı?",
    subject: "Kampanya / indirim",
    message: "Merhaba, şu an geçerli bir kampanyanız veya indiriminiz var mı?",
  },
];

const formatHours = (h) => {
  if (h < 1) return "1 saatten kısa";
  if (h < 24) return `~${Math.round(h)} saat`;
  return `~${Math.round(h / 24)} gün`;
};

function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const [similar, setSimilar] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [myReview, setMyReview] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  const [askOpen, setAskOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [askError, setAskError] = useState("");
  const [askBusy, setAskBusy] = useState(false);

  const [favorite, setFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const isOwner = !!currentUser && business?.ownerId === currentUser.id;

  const loadBusiness = useCallback(async () => {
    try {
      const res = await apiRequest.get(`/businesses/${id}`);
      setBusiness(res.data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(
    async (page = 1) => {
      try {
        const res = await apiRequest.get(`/businesses/${id}/reviews?page=${page}&limit=10`);
        setReviews((prev) => (page === 1 ? res.data.data : [...prev, ...res.data.data]));
        setReviewTotal(res.data.total);
        setReviewPage(page);
      } catch {
        /* yorumlar yüklenemese de sayfa çalışmaya devam eder */
      }
    },
    [id],
  );

  const loadMyReview = useCallback(async () => {
    if (!currentUser) return setMyReview(null);
    try {
      const res = await apiRequest.get(`/businesses/${id}/reviews/mine`);
      setMyReview(res.data);
      if (res.data) {
        setRating(res.data.rating);
        setComment(res.data.comment || "");
      }
    } catch {
      setMyReview(null);
    }
  }, [id, currentUser]);

  useEffect(() => {
    setLoading(true);
    setActivePhoto(0);
    setSimilar([]);
    loadBusiness();
    loadReviews(1);
  }, [loadBusiness, loadReviews]);

  useEffect(() => {
    loadMyReview();
  }, [loadMyReview]);

  // Favori durumu (giriş yapmış kullanıcı için)
  useEffect(() => {
    if (!currentUser) {
      setFavorite(false);
      return;
    }
    let cancelled = false;
    apiRequest
      .get(`/businesses/${id}/favorite`)
      .then((r) => !cancelled && setFavorite(!!r.data?.favorite))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  // İşletmenin yayındaki kampanyaları
  useEffect(() => {
    setCampaigns([]);
    let cancelled = false;
    apiRequest
      .get(`/businesses/${id}/posts`)
      .then((r) => !cancelled && setCampaigns(r.data?.data || []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Anonim sayaç: profil görüntüleme / arama / yol tarifi. Sahibin kendi
  // tıklamaları sayılmaz; aynı oturumda aynı işletme için görüntüleme bir kez sayılır.
  const businessOwnerId = business?.ownerId;
  const trackedOwner = !!currentUser && businessOwnerId === currentUser.id;
  const track = (type) => {
    if (trackedOwner) return;
    apiRequest.post(`/businesses/${id}/track`, { type }).catch(() => {});
  };
  useEffect(() => {
    if (!businessOwnerId || trackedOwner) return;
    try {
      const key = `biz_view_${id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage kapalıysa yine de say */
    }
    apiRequest.post(`/businesses/${id}/track`, { type: "view" }).catch(() => {});
  }, [id, businessOwnerId, trackedOwner]);

  // #reviews gibi bir bağlantıyla gelindiyse ilgili bölüme kaydır
  useEffect(() => {
    if (!businessOwnerId || !window.location.hash) return;
    const hash = window.location.hash.slice(1);
    const t = setTimeout(
      () => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      300,
    );
    return () => clearTimeout(t);
  }, [businessOwnerId]);

  const toggleFavorite = async () => {
    if (!currentUser) return navigate("/login");
    if (favBusy) return;
    setFavBusy(true);
    const next = !favorite;
    setFavorite(next);
    try {
      if (next) await apiRequest.post(`/businesses/${id}/favorite`);
      else await apiRequest.delete(`/businesses/${id}/favorite`);
    } catch {
      setFavorite(!next);
    } finally {
      setFavBusy(false);
    }
  };

  const openReply = (review) => {
    setReplyFor(review.id);
    setReplyText(review.ownerReply || "");
    setReplyError("");
  };

  const submitReply = async (reviewId) => {
    setReplyBusy(true);
    setReplyError("");
    try {
      await apiRequest.put(`/businesses/${id}/reviews/${reviewId}/reply`, { reply: replyText });
      setReplyFor(null);
      setReplyText("");
      await loadReviews(1);
    } catch (err) {
      setReplyError(err.response?.data?.message || "Yanıt kaydedilemedi.");
    } finally {
      setReplyBusy(false);
    }
  };

  const removeReply = async (reviewId) => {
    if (!window.confirm("Yanıtınızı silmek istiyor musunuz?")) return;
    try {
      await apiRequest.delete(`/businesses/${id}/reviews/${reviewId}/reply`);
      await loadReviews(1);
    } catch (err) {
      setReplyError(err.response?.data?.message || "Yanıt silinemedi.");
    }
  };

  // Benzer işletmeler: aynı kategori + aynı şehir, yoksa sadece aynı kategori
  const businessId = business?.id;
  const businessCategoryId = business?.category?.id;
  const businessCity = business?.city;
  useEffect(() => {
    if (!businessId || !businessCategoryId) return undefined;
    let cancelled = false;
    const fetchSimilar = async (withCity) => {
      const q = new URLSearchParams({ category: businessCategoryId, limit: "6", sort: "rating" });
      if (withCity) q.set("city", businessCity);
      const res = await apiRequest.get(`/businesses?${q.toString()}`);
      return (res.data?.data || []).filter((b) => b.id !== businessId).slice(0, 4);
    };
    (async () => {
      try {
        let list = await fetchSimilar(true);
        if (list.length === 0) list = await fetchSimilar(false);
        if (!cancelled) setSimilar(list);
      } catch {
        /* benzer işletmeler opsiyonel */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, businessCategoryId, businessCity]);

  // SEO: başlık + LocalBusiness yapılandırılmış verisi
  useEffect(() => {
    if (!business) return undefined;
    const previousTitle = document.title;
    document.title = `${business.name} - ${business.district}, ${business.city} | Bedavadanbul`;

    const ld = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name,
      telephone: `+${String(business.phone).replace(/\D/g, "")}`,
      url: window.location.href,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: business.district,
        addressRegion: business.city,
        addressCountry: "TR",
      },
    };
    if (business.logo) ld.image = business.logo;
    if (business.description) ld.description = business.description.slice(0, 300);
    if (business.ratingCount > 0) {
      ld.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: business.ratingAvg,
        reviewCount: business.ratingCount,
      };
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      script.remove();
    };
  }, [business]);

  const photos = business?.photos || [];

  // Lightbox: Esc ile kapat, ok tuşlarıyla gez
  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActivePhoto((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setActivePhoto((i) => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, photos.length]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return setReviewError("Lütfen bir puan seçin.");
    setReviewBusy(true);
    setReviewError("");
    try {
      await apiRequest.post(`/businesses/${id}/reviews`, { rating, comment });
      await Promise.all([loadBusiness(), loadReviews(1), loadMyReview()]);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Yorum kaydedilemedi.");
    } finally {
      setReviewBusy(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Yorumunuzu silmek istiyor musunuz?")) return;
    try {
      await apiRequest.delete(`/businesses/${id}/reviews/${reviewId}`);
      setRating(0);
      setComment("");
      await Promise.all([loadBusiness(), loadReviews(1), loadMyReview()]);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Yorum silinemedi.");
    }
  };

  const openAsk = (preset) => {
    if (!currentUser) return navigate("/login");
    setAskError("");
    if (preset && preset.subject) {
      setSubject(preset.subject);
      setMessage(preset.message);
    }
    setAskOpen(true);
  };

  const submitAsk = async (e) => {
    e.preventDefault();
    setAskBusy(true);
    setAskError("");
    try {
      const res = await apiRequest.post(`/businesses/${id}/inquiries`, {
        subject,
        message,
      });
      navigate(`/sorularim?t=${res.data.id}`);
    } catch (err) {
      setAskError(err.response?.data?.message || "Soru gönderilemedi.");
    } finally {
      setAskBusy(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* kullanıcı paylaşımı iptal etti */
    }
  };

  const goTo = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stepPhoto = (dir) => setActivePhoto((i) => (i + dir + photos.length) % photos.length);

  // Mobilde parmakla kaydırma
  const touchStartX = { current: null };
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || photos.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) stepPhoto(dx < 0 ? 1 : -1);
  };

  const openLightbox = (index) => {
    setActivePhoto(index);
    setLightbox(true);
  };

  if (loading) return <Loader />;

  if (notFound || !business) {
    return (
      <div className="bizPage">
        <div className="bizNotFound">
          <FiBriefcase />
          <h2>İşletme bulunamadı</h2>
          <Link to="/isletmeler">İşletmelere dön</Link>
        </div>
      </div>
    );
  }

  const theme = bizTheme(business.name);
  const hasRating = business.ratingCount > 0;
  const hoursLines = (business.workingHours || "")
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  const stats = business.stats;
  const memberSince = new Date(business.createdAt).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
  const fullAddress = `${business.address}, ${business.district}, ${business.city}`;
  const mapQuery = encodeURIComponent(`${business.name} ${fullAddress}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const mapEmbed = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const lead =
    business.description ||
    `${business.name}, ${business.district} / ${business.city} bölgesinde ${
      business.category?.name || "hizmet"
    } alanında hizmet veriyor.`;

  return (
    <div className="bizPage">
      <nav className="bizCrumb">
        <Link to="/">Anasayfa</Link> / <Link to="/isletmeler">İşletmeler</Link> /{" "}
        <span>{business.name}</span>
      </nav>

      {/* ===== MEDYA + KİMLİK ===== */}
      <section className="bizHero">
        <div className="bizMedia">
          {photos.length > 0 ? (
            <div className="photoStage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <img
                key={activePhoto}
                className="photoMain"
                src={photos[activePhoto]}
                alt={`${business.name} fotoğraf ${activePhoto + 1}`}
                onClick={() => openLightbox(activePhoto)}
              />
              <span className="photoShade" />
              {photos.length > 1 && (
                <>
                  <span className="photoCounter">
                    {activePhoto + 1} / {photos.length}
                  </span>
                  <button
                    type="button"
                    className="navArrow prev"
                    aria-label="Önceki fotoğraf"
                    onClick={() => stepPhoto(-1)}
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="navArrow next"
                    aria-label="Sonraki fotoğraf"
                    onClick={() => stepPhoto(1)}
                  >
                    <FiChevronRight />
                  </button>
                  <div className="thumbRail">
                    {photos.map((p, i) => (
                      <button
                        type="button"
                        key={p + i}
                        className={i === activePhoto ? "active" : ""}
                        onClick={() => setActivePhoto(i)}
                        aria-label={`Fotoğraf ${i + 1}`}
                      >
                        <img src={p} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="themedCover" style={{ background: theme.gradient }}>
              <span className="watermark">{theme.initials}</span>
              <i className="orb o1" />
              <i className="orb o2" />
              <i className="orb o3" />
              {business.category?.name && (
                <span className="coverCategory">{business.category.name}</span>
              )}
            </div>
          )}

          <button
            type="button"
            className={`mediaBtn fav ${favorite ? "on" : ""} ${photos.length > 0 ? "withZoom" : ""}`}
            onClick={toggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <FiHeart />
            <span>{favorite ? "Favoride" : "Favorile"}</span>
          </button>
          <button type="button" className="mediaBtn share" onClick={share} aria-label="Paylaş">
            {copied ? <FiCheck /> : <FiShare2 />}
            <span>{copied ? "Bağlantı kopyalandı" : "Paylaş"}</span>
          </button>
          {photos.length > 0 && (
            <button type="button" className="mediaBtn zoom" onClick={() => openLightbox(activePhoto)}>
              <FiMaximize2 />
              <span>Büyüt</span>
            </button>
          )}
        </div>

        <div className="bizIdentity">
          <div className="bizLogo">
            <BizAvatar name={business.name} logo={business.logo} />
          </div>

          <div className="bizTitleBlock">
            <div className="bizChips">
              {business.category?.name && (
                <span className="chip category">{business.category.name}</span>
              )}
              <span className="chip place">
                <FiMapPin /> {business.district}, {business.city}
              </span>
            </div>
            {(business.isVerified || business.isFeatured) && (
              <div className="bizBadgeRow">
                {business.isVerified && <VerifiedBadge />}
                {business.isFeatured && <FeaturedBadge />}
              </div>
            )}
            <h1>{business.name}</h1>
            <div className="bizRatingLine">
              {hasRating ? (
                <>
                  <span className="ratingBadge">{business.ratingAvg.toFixed(1)}</span>
                  <StarRating value={business.ratingAvg} size={18} />
                  <button type="button" className="ratingLink" onClick={() => goTo("reviews")}>
                    {business.ratingCount} değerlendirme
                  </button>
                </>
              ) : (
                <span className="ratingCount">Yeni işletme · henüz değerlendirme yok</span>
              )}
            </div>
          </div>

          <div className="bizActions">
            <a href={telHref(business.phone)} onClick={() => track("call")} className="primaryBtn">
              <FiPhone /> Ara
            </a>
            {isOwner ? (
              <Link to="/profile?tab=business" className="ghostBtn">
                <FiEdit3 /> Profili düzenle
              </Link>
            ) : (
              <button type="button" className="ghostBtn" onClick={() => openAsk()}>
                <FiMessageCircle /> Soru Sor
              </button>
            )}
          </div>
        </div>

        {/* Güven şeridi */}
        <div className="trustStrip">
          <div className="trustItem">
            <span className="trustIcon">
              <FiStar />
            </span>
            <span>
              <strong>{hasRating ? `${business.ratingAvg.toFixed(1)} / 5` : "Yeni"}</strong>
              <small>{hasRating ? `${business.ratingCount} gerçek yorum` : "İlk yorumu siz yapın"}</small>
            </span>
          </div>
          {stats && (
            <div className="trustItem">
              <span className="trustIcon">
                <FiMessageCircle />
              </span>
              <span>
                <strong>%{stats.answeredRate} yanıt oranı</strong>
                <small>Gelen sorulara dönüş</small>
              </span>
            </div>
          )}
          {stats && stats.medianResponseHours !== null && (
            <div className="trustItem">
              <span className="trustIcon">
                <FiZap />
              </span>
              <span>
                <strong>{formatHours(stats.medianResponseHours)}</strong>
                <small>Ortalama yanıt süresi</small>
              </span>
            </div>
          )}
          <div className="trustItem">
            <span className="trustIcon">
              <FiCalendar />
            </span>
            <span>
              <strong>{memberSince}</strong>
              <small>Üyelik başlangıcı</small>
            </span>
          </div>
          <div className="trustItem">
            <span className="trustIcon green">
              <FiLock />
            </span>
            <span>
              <strong>Gizli soru-cevap</strong>
              <small>Sadece siz ve işletme görür</small>
            </span>
          </div>
        </div>
      </section>

      {/* ===== YAPIŞKAN BÖLÜM MENÜSÜ ===== */}
      <nav className="bizSectionNav" aria-label="Sayfa bölümleri">
        <button type="button" onClick={() => goTo("about")}>
          Hakkında
        </button>
        {campaigns.length > 0 && (
          <button type="button" onClick={() => goTo("campaigns")}>
            Kampanyalar ({campaigns.length})
          </button>
        )}
        <button type="button" onClick={() => goTo("location")}>
          Konum & Saatler
        </button>
        <button type="button" onClick={() => goTo("reviews")}>
          Yorumlar ({reviewTotal})
        </button>
        {similar.length > 0 && (
          <button type="button" onClick={() => goTo("similar")}>
            Benzer İşletmeler
          </button>
        )}
      </nav>

      <div className="bizColumns">
        <div className="bizMainCol">
          <section className="bizCard" id="about">
            <h2>Hakkında</h2>
            <p className="bizAbout">{lead}</p>
            {isOwner && !business.description && (
              <p className="ownerTip">
                İpucu: Açıklama eklerseniz aramalarda ve müşterilerde daha güvenilir görünürsünüz.{" "}
                <Link to="/profile?tab=business">Şimdi ekle</Link>
              </p>
            )}
          </section>

          {campaigns.length > 0 && (
            <section className="bizCard" id="campaigns">
              <h2>Aktif kampanyalar</h2>
              <div className="campaignGrid">
                {campaigns.map((c) => (
                  <Link key={c.id} to={`/${c.id}`} className="campaignCard">
                    <span className="campaignImg">
                      {c.images?.[0] ? (
                        <img src={c.images[0]} alt={c.title} loading="lazy" />
                      ) : (
                        <FiTag />
                      )}
                      {c.postDetail?.discountAmount && (
                        <span className="campaignDiscount">{c.postDetail.discountAmount}</span>
                      )}
                    </span>
                    <span className="campaignInfo">
                      <strong>{c.title}</strong>
                      <small>
                        {c.expireDate
                          ? `Son gün: ${new Date(c.expireDate).toLocaleDateString("tr-TR")}`
                          : `${c.city}${c.district ? ` / ${c.district}` : ""}`}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="bizCard" id="location">
            <h2>Konum & Çalışma Saatleri</h2>
            <div className="locGrid">
              <div className="mapWrap">
                <iframe
                  title={`${business.name} konumu`}
                  src={mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="locInfo">
                <div className="locBlock">
                  <h3>
                    <FiMapPin /> Adres
                  </h3>
                  <p>
                    {business.address}
                    <br />
                    {business.district}, {business.city}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghostBtn small"
                    onClick={() => track("directions")}
                  >
                    <FiNavigation /> Yol Tarifi Al
                  </a>
                </div>
                <div className="locBlock">
                  <h3>
                    <FiClock /> Çalışma saatleri
                  </h3>
                  {hoursLines.length > 0 ? (
                    <ul className="hoursList">
                      {hoursLines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bizHint">
                      Çalışma saatleri için işletmeyi arayabilirsiniz.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bizCard" id="reviews">
            <h2>Değerlendirmeler</h2>

            <div className="reviewSummary">
              <div className="bigScore">
                <strong>{hasRating ? business.ratingAvg.toFixed(1) : "–"}</strong>
                <StarRating value={business.ratingAvg} size={18} />
                <span>{reviewTotal} yorum</span>
              </div>

              <div className="reviewCta">
                {isOwner ? (
                  <p className="bizHint">Kendi işletmenizi değerlendiremezsiniz.</p>
                ) : currentUser ? (
                  <form className="reviewForm" onSubmit={submitReview}>
                    <strong>{myReview ? "Yorumunuzu düzenleyin" : "Deneyiminizi puanlayın"}</strong>
                    <StarRating value={rating} size={28} onChange={setRating} />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Deneyiminizi paylaşın (isteğe bağlı)"
                      rows={3}
                      maxLength={500}
                    />
                    {reviewError && <p className="bizError">{reviewError}</p>}
                    <div className="reviewFormActions">
                      <button type="submit" className="primaryBtn" disabled={reviewBusy}>
                        {myReview ? "Güncelle" : "Yorum Yap"}
                      </button>
                      {myReview && (
                        <button
                          type="button"
                          className="dangerBtn"
                          onClick={() => deleteReview(myReview.id)}
                        >
                          <FiTrash2 /> Sil
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <p className="bizHint">
                    Yorum yapmak için <Link to="/login">giriş yapın</Link>.
                  </p>
                )}
              </div>
            </div>

            <div className="reviewList">
              {reviews.map((r) => (
                <article key={r.id} className="reviewItem">
                  <div className="reviewAvatar">
                    {(r.user?.username || "?").charAt(0).toLocaleUpperCase("tr-TR")}
                  </div>
                  <div className="reviewBody">
                    <div className="reviewTop">
                      <strong>{r.user?.username}</strong>
                      <span>{formatDateTime(r.createdAt)}</span>
                    </div>
                    <StarRating value={r.rating} size={14} />
                    {r.comment && <p>{r.comment}</p>}

                    {r.ownerReply && replyFor !== r.id && (
                      <div className="ownerReply">
                        <span className="ownerReplyHead">
                          <FiCornerDownRight /> <strong>{business.name}</strong> yanıtladı
                          {r.ownerReplyAt && <small>{formatDateTime(r.ownerReplyAt)}</small>}
                        </span>
                        <p>{r.ownerReply}</p>
                      </div>
                    )}

                    {isOwner && replyFor !== r.id && (
                      <div className="replyActions">
                        <button type="button" onClick={() => openReply(r)}>
                          {r.ownerReply ? "Yanıtı düzenle" : "Yanıtla"}
                        </button>
                        {r.ownerReply && (
                          <button type="button" className="danger" onClick={() => removeReply(r.id)}>
                            Yanıtı sil
                          </button>
                        )}
                      </div>
                    )}

                    {isOwner && replyFor === r.id && (
                      <div className="replyForm">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Bu yoruma herkese açık bir yanıt yazın"
                          rows={3}
                          maxLength={500}
                          autoFocus
                        />
                        {replyError && <p className="bizError">{replyError}</p>}
                        <div className="replyFormActions">
                          <button
                            type="button"
                            className="primaryBtn"
                            disabled={replyBusy}
                            onClick={() => submitReply(r.id)}
                          >
                            {replyBusy ? "Kaydediliyor..." : "Yanıtı yayınla"}
                          </button>
                          <button type="button" className="ghostBtn" onClick={() => setReplyFor(null)}>
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {reviews.length === 0 && <p className="bizHint">İlk yorumu siz yapın.</p>}
            </div>

            {reviews.length < reviewTotal && (
              <button
                type="button"
                className="ghostBtn moreBtn"
                onClick={() => loadReviews(reviewPage + 1)}
              >
                Daha fazla yorum
              </button>
            )}
          </section>
        </div>

        {/* ===== SAĞ KOLON ===== */}
        <aside className="bizSideCol">
          <section className="bizCard bizContactCard">
            <h2>İletişim</h2>
            <ul className="bizContact">
              <li>
                <span className="iconBox">
                  <FiPhone />
                </span>
                <a href={telHref(business.phone)} onClick={() => track("call")}>{formatPhone(business.phone)}</a>
              </li>
              {business.website && (
                <li>
                  <span className="iconBox">
                    <FiGlobe />
                  </span>
                  <a href={business.website} target="_blank" rel="noopener noreferrer nofollow">
                    {business.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </li>
              )}
              <li>
                <span className="iconBox">
                  <FiMapPin />
                </span>
                <span>
                  {business.district}, {business.city}
                </span>
              </li>
            </ul>

            <a href={telHref(business.phone)} onClick={() => track("call")} className="primaryBtn full">
              <FiPhone /> Hemen Ara
            </a>
            {!isOwner && (
              <button type="button" className="ghostBtn full" onClick={() => openAsk()}>
                <FiMessageCircle /> İşletmeye Soru Sor
              </button>
            )}
          </section>

          {!isOwner && (
            <section className="bizCard quickAsk">
              <h2>Hızlı soru sor</h2>
              <p className="bizHint small">Tek tıkla hazır bir soruyla başlayın, istediğiniz gibi düzenleyin.</p>
              <div className="quickChips">
                {QUICK_QUESTIONS.map((q) => (
                  <button type="button" key={q.label} onClick={() => openAsk(q)}>
                    {q.label}
                  </button>
                ))}
              </div>
              <p className="privacyNote">
                <FiLock />
                <span>Sorularınız herkese açık değildir; sadece siz ve işletme görebilir.</span>
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* ===== BENZER İŞLETMELER ===== */}
      {similar.length > 0 && (
        <section className="similarSection" id="similar">
          <div className="similarHead">
            <h2>Benzer işletmeler</h2>
            <Link to={`/isletmeler?category=${business.category?.id}`}>
              Tümünü gör <FiArrowRight />
            </Link>
          </div>
          <div className="regionLinks">
            <Link to={districtPath(business.city, business.district)}>
              <FiMapPin /> {business.district} işletmeleri
            </Link>
            <Link to={cityPath(business.city)}>
              <FiMapPin /> {business.city} işletmeleri
            </Link>
          </div>
          <div className="similarGrid">
            {similar.map((b) => (
              <Link key={b.id} to={`/isletme/${b.id}`} className="simCard">
                <span className="simLogo">
                  <BizAvatar name={b.name} logo={b.logo} />
                </span>
                <span className="simInfo">
                  <strong>{b.name}</strong>
                  <span className="simRating">
                    <StarRating value={b.ratingAvg} size={13} />
                    {b.ratingCount > 0 ? `${b.ratingAvg.toFixed(1)} (${b.ratingCount})` : "Yeni"}
                  </span>
                  <small>
                    <FiMapPin /> {b.district}, {b.city}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== KAPANIŞ ÇAĞRISI ===== */}
      {!isOwner && (
        <section className="bizClosing" style={{ background: theme.gradient }}>
          <div>
            <h2>{business.name} ile iletişime geç</h2>
            <p>Fiyat, randevu veya kampanya bilgisini işletmeden doğrudan ve özel olarak öğren.</p>
          </div>
          <div className="closingActions">
            <button type="button" className="closingBtn solid" onClick={() => openAsk()}>
              <FiMessageCircle /> Soru Sor
            </button>
            <a href={telHref(business.phone)} onClick={() => track("call")} className="closingBtn line">
              <FiPhone /> Ara
            </a>
          </div>
        </section>
      )}

      {/* ===== MOBİL SABİT AKSİYON ÇUBUĞU ===== */}
      <div className="bizStickyBar">
        <a href={telHref(business.phone)} onClick={() => track("call")} className="primaryBtn">
          <FiPhone /> Ara
        </a>
        {isOwner ? (
          <Link to="/profile?tab=business" className="ghostBtn">
            <FiEdit3 /> Düzenle
          </Link>
        ) : (
          <button type="button" className="ghostBtn" onClick={() => openAsk()}>
            <FiMessageCircle /> Soru Sor
          </button>
        )}
      </div>

      {lightbox && photos.length > 0 && (
        <div className="bizLightbox" onClick={() => setLightbox(false)}>
          <button
            type="button"
            className="lbClose"
            aria-label="Kapat"
            onClick={() => setLightbox(false)}
          >
            <FiX />
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              className="lbNav prev"
              aria-label="Önceki fotoğraf"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhoto((i) => (i - 1 + photos.length) % photos.length);
              }}
            >
              <FiChevronLeft />
            </button>
          )}
          <img
            src={photos[activePhoto]}
            alt={business.name}
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <button
              type="button"
              className="lbNav next"
              aria-label="Sonraki fotoğraf"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhoto((i) => (i + 1) % photos.length);
              }}
            >
              <FiChevronRight />
            </button>
          )}
          <span className="lbCounter">
            {activePhoto + 1} / {photos.length}
          </span>
        </div>
      )}

      {askOpen && (
        <div className="bizModalOverlay" onClick={() => setAskOpen(false)}>
          <form
            className="bizModal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitAsk}
          >
            <h3>{business.name} işletmesine soru sor</h3>
            <div className="quickChips">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  type="button"
                  key={q.label}
                  className={subject === q.subject ? "active" : ""}
                  onClick={() => {
                    setSubject(q.subject);
                    setMessage(q.message);
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Konu"
              maxLength={100}
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sorunuzu yazın"
              rows={5}
              maxLength={1000}
              required
            />
            <p className="bizHint small">
              Yanıt “Sorularım” sayfanıza düşer. Yazışmayı sadece siz ve işletme görebilir.
            </p>
            {askError && <p className="bizError">{askError}</p>}
            <div className="modalActions">
              <button type="button" className="ghostBtn" onClick={() => setAskOpen(false)}>
                Vazgeç
              </button>
              <button type="submit" className="primaryBtn" disabled={askBusy}>
                {askBusy ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BusinessPage;
