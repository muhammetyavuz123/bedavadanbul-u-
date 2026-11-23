import { useContext, useEffect, useMemo, useState } from "react";
import "./dashboard.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlusCircle,
  FiBriefcase,
  FiShare2,
  FiBarChart2,
  FiList,
  FiFlag,
  FiMapPin,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

const postStatus = (approved) =>
  approved === true
    ? { key: "approved", label: "Yayında" }
    : approved === false
      ? { key: "pending", label: "Onay bekliyor" }
      : { key: "rejected", label: "Reddedildi" };

// onNavigate: panelde başka bir sekmeye geçmek için (Tab bileşeni verir)
export default function Dashboard({ onNavigate = () => {} }) {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === "admin";
  const isBusiness = currentUser?.role === "business";

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(undefined); // undefined: yükleniyor, null: profil yok

  useEffect(() => {
    let cancelled = false;
    const fetchCampaigns = async () => {
      try {
        const res = await apiRequest.get(
          isAdmin
            ? `/posts?approved=false` // admin onay bekleyenleri görebilir
            : `/posts?userId=${currentUser?.id}`, // kullanıcı kendi kampanyalarını görür
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (!cancelled) setCampaigns(list);
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCampaigns();

    if (isBusiness) {
      apiRequest
        .get("/businesses/me")
        .then((r) => !cancelled && setBusiness(r.data || null))
        .catch(() => !cancelled && setBusiness(null));
    }
    return () => {
      cancelled = true;
    };
  }, [currentUser, isAdmin, isBusiness]);

  const stats = useMemo(
    () => ({
      active: campaigns.filter((c) => c.approved === true).length,
      pending: campaigns.filter((c) => c.approved === false).length,
      rejected: campaigns.filter((c) => c.approved === "rejected").length,
    }),
    [campaigns],
  );

  const recentPosts = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [campaigns],
  );

  // İşletme sahibine "sıradaki adım" önerisi
  const nextStep = useMemo(() => {
    if (!isBusiness || business === undefined) return null;
    if (!business) {
      return {
        tone: "warn",
        title: "İşletme profilinizi oluşturun",
        text: "Müşteriler sizi listede ve haritada bulsun. Başvurunuz yönetici onayına gönderilir.",
        cta: "Profili oluştur",
        go: "business",
      };
    }
    if (business.status === "pending") {
      return {
        tone: "info",
        title: "Başvurunuz inceleniyor",
        text: "Onay beklerken logo, fotoğraf ve açıklamanızı hazırlayabilirsiniz.",
        cta: "Profili düzenle",
        go: "business",
      };
    }
    if (business.status === "rejected") {
      return {
        tone: "bad",
        title: "Başvurunuz onaylanmadı",
        text: business.rejectReason
          ? `Gerekçe: ${business.rejectReason}`
          : "Bilgilerinizi düzeltip yeniden gönderebilirsiniz.",
        cta: "Düzelt ve gönder",
        go: "business",
      };
    }
    if (business.status === "approved" && !business.isActive) {
      return {
        tone: "bad",
        title: "Profiliniz şu anda yayında değil",
        text: "Yönetici tarafından yayından kaldırıldı. Ayrıntı için bizimle iletişime geçin.",
        cta: "İşletme paneli",
        go: "business",
      };
    }
    return null;
  }, [isBusiness, business]);

  const quick = isAdmin
    ? [
        { key: "profilList", icon: FiList, label: "Kampanyalar", hint: "Onayla ve yönet" },
        { key: "adminBusinesses", icon: FiBriefcase, label: "İşletmeler", hint: "Başvurular" },
        { key: "adminReports", icon: FiFlag, label: "Şikâyetler", hint: "İncele" },
      ]
    : [
        { key: "newPost", icon: FiPlusCircle, label: "Kampanya ekle", hint: "Hemen yayınla", primary: true },
        ...(isBusiness
          ? [
              { key: "business", icon: FiBriefcase, label: "İşletme profili", hint: "Bilgiler ve sadakat" },
              { key: "businessShare", icon: FiShare2, label: "QR & Paylaşım", hint: "Vitrin afişi" },
              { key: "businessStats", icon: FiBarChart2, label: "İstatistik", hint: "Son 30 gün" },
            ]
          : [{ key: "profilList", icon: FiList, label: "Kampanyalarım", hint: "Tümünü gör" }]),
      ];

  const place = [currentUser?.city, currentUser?.district]
    .filter(Boolean)
    .reverse()
    .join(", ");

  return (
    <div className="panelHome">
      <section className="homeHero">
        <div className="heroText">
          <span className="heroKicker">{isAdmin ? "Yönetici paneli" : "Esnaf paneli"}</span>
          <h2>Merhaba, {currentUser?.username}</h2>
          <p>
            {isAdmin
              ? "Onay bekleyen kampanya ve başvuruları buradan yönetin."
              : "Kampanyalarınızı yönetin, müşterilerinizi tekrar getirin."}
          </p>
          {place && (
            <span className="heroPlace">
              <FiMapPin /> {place}
            </span>
          )}
        </div>
        <img
          className="heroAvatar"
          src={
            currentUser?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt=""
        />
      </section>

      {nextStep && (
        <section className={`nextStep ${nextStep.tone}`}>
          <FiAlertCircle className="nsIcon" />
          <div className="nsText">
            <strong>{nextStep.title}</strong>
            <p>{nextStep.text}</p>
          </div>
          <button type="button" onClick={() => onNavigate(nextStep.go)}>
            {nextStep.cta} <FiArrowRight />
          </button>
        </section>
      )}

      <section className="quickGrid" aria-label="Hızlı işlemler">
        {quick.map(({ key, icon: Icon, label, hint, primary }) => (
          <button
            type="button"
            key={key}
            className={`quickCard${primary ? " primary" : ""}`}
            onClick={() => onNavigate(key)}
          >
            <span className="qIco">
              <Icon />
            </span>
            <span className="qText">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <FiArrowRight className="qArrow" />
          </button>
        ))}
      </section>

      <section className="statGrid">
        <div className="statTile ok">
          <span className="sIco">
            <FiCheckCircle />
          </span>
          <b>{stats.active}</b>
          <span>Yayındaki kampanya</span>
        </div>
        <div className="statTile wait">
          <span className="sIco">
            <FiClock />
          </span>
          <b>{stats.pending}</b>
          <span>Onay bekleyen</span>
        </div>
        <div className="statTile off">
          <span className="sIco">
            <FiXCircle />
          </span>
          <b>{stats.rejected}</b>
          <span>Reddedilen</span>
        </div>
      </section>

      <section className="recentBox">
        <div className="recentHead">
          <h3>Son kampanyalar</h3>
          {recentPosts.length > 0 && (
            <button type="button" onClick={() => onNavigate("profilList")}>
              Tümünü gör <FiArrowRight />
            </button>
          )}
        </div>

        {loading && <p className="recentEmpty">Yükleniyor...</p>}

        {!loading && recentPosts.length === 0 && (
          <div className="recentEmpty">
            <p>Henüz kampanya yok.</p>
            {!isAdmin && (
              <button type="button" className="emptyCta" onClick={() => onNavigate("newPost")}>
                <FiPlusCircle /> İlk kampanyanı ekle
              </button>
            )}
          </div>
        )}

        <ul className="postList">
          {recentPosts.map((post) => {
            const st = postStatus(post.approved);
            return (
              <li key={post.id || post._id}>
                <span className="pTitle">{post.title}</span>
                <span className={`pStatus ${st.key}`}>{st.label}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
