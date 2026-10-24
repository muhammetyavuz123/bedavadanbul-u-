import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiPhoneCall,
  FiNavigation,
  FiHeart,
  FiMessageCircle,
  FiTag,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import Loader from "../loader/Loader";
import apiRequest from "../../lib/apiRequest";
import "./businessStats.scss";

const METRICS = [
  { key: "views", label: "Görüntüleme", icon: FiEye },
  { key: "calls", label: "Arama", icon: FiPhoneCall },
  { key: "directions", label: "Yol tarifi", icon: FiNavigation },
];

const shortDate = (iso) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${m}`;
};

// Basit, bağımlılıksız SVG sütun grafiği
function BarChart({ series, metric }) {
  const max = Math.max(1, ...series.map((d) => d[metric]));
  const W = 600;
  const H = 160;
  const gap = 3;
  const barW = (W - gap * (series.length - 1)) / series.length;
  const [hover, setHover] = useState(null);

  return (
    <div className="chartWrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="0" x2={W} y1={H - H * p} y2={H - H * p} className="gridLine" />
        ))}
        {series.map((d, i) => {
          const h = (d[metric] / max) * H;
          const x = i * (barW + gap);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={0} width={barW} height={H} fill="transparent" />
              <rect
                x={x}
                y={H - h}
                width={barW}
                height={Math.max(h, d[metric] > 0 ? 2 : 0)}
                rx="2"
                className={hover === i ? "bar hot" : "bar"}
              />
            </g>
          );
        })}
      </svg>
      <div className="axisRow">
        <span>{shortDate(series[0].date)}</span>
        <span>{shortDate(series[series.length - 1].date)}</span>
      </div>
      <div className="chartTip">
        {hover !== null
          ? `${shortDate(series[hover].date)} · ${series[hover][metric]}`
          : `En yüksek gün: ${max}`}
      </div>
    </div>
  );
}

function BusinessStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metric, setMetric] = useState("views");

  useEffect(() => {
    let cancelled = false;
    apiRequest
      .get("/businesses/me/stats?days=30")
      .then((res) => !cancelled && setData(res.data))
      .catch(() => !cancelled && setError("İstatistikler yüklenemedi."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const total = useMemo(() => data?.totals?.[metric] || 0, [data, metric]);

  if (loading) return <Loader />;
  if (error) return <p className="statsError">{error}</p>;
  if (!data) {
    return (
      <div className="statsEmpty">
        <h3>Önce işletme profilinizi oluşturun</h3>
        <p>İstatistikler, profil yayına girdikten sonra burada görünür.</p>
      </div>
    );
  }

  const cards = [
    { icon: FiEye, label: "Profil görüntüleme", value: data.totals.views, hint: "son 30 gün" },
    { icon: FiPhoneCall, label: "Arama tıklaması", value: data.totals.calls, hint: "son 30 gün" },
    {
      icon: FiNavigation,
      label: "Yol tarifi",
      value: data.totals.directions,
      hint: "son 30 gün",
    },
    { icon: FiHeart, label: "Favoriye ekleyen", value: data.favoriteCount, hint: "toplam" },
    {
      icon: FiMessageCircle,
      label: "Gelen soru",
      value: data.inquiryTotal,
      hint: `${data.openInquiries} yanıt bekliyor`,
    },
    { icon: FiTag, label: "Aktif kampanya", value: data.activePosts, hint: "yayında" },
    {
      icon: FiCheckCircle,
      label: "Kampanya kullanımı",
      value: data.redemptions ?? 0,
      hint: `son 30 gün · toplam ${data.redemptionTotal ?? 0} (kullanıcı beyanı)`,
    },
    {
      icon: FiStar,
      label: "Puan",
      value: data.ratingCount > 0 ? data.ratingAvg.toFixed(1) : "–",
      hint: `${data.ratingCount} yorum · son 30 günde ${data.recentReviews}`,
    },
  ];

  const noTraffic = data.totals.views + data.totals.calls + data.totals.directions === 0;

  return (
    <div className="bizStats">
      <div className="statsHead">
        <h2>İstatistikler</h2>
        <p>Müşteriler profilinizle nasıl etkileşime giriyor? Veriler kişisel bilgi içermez.</p>
      </div>

      <div className="statCards">
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="statCard">
            <span className="statIcon">
              <Icon />
            </span>
            <strong>{value}</strong>
            <span className="statLabel">{label}</span>
            <small>{hint}</small>
          </div>
        ))}
      </div>

      <div className="statChart">
        <div className="chartHead">
          <h3>Son 30 gün</h3>
          <div className="metricTabs">
            {METRICS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={metric === key ? "active" : ""}
                onClick={() => setMetric(key)}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="chartTotal">
          <strong>{total}</strong> {METRICS.find((m) => m.key === metric).label.toLowerCase()}
        </div>
        <BarChart series={data.series} metric={metric} />
        {noTraffic && (
          <p className="statsHint">
            Henüz veri yok. Profil linkinizi ve QR afişinizi paylaştıkça burada hareket görmeye
            başlarsınız.
          </p>
        )}
      </div>
    </div>
  );
}

export default BusinessStats;
