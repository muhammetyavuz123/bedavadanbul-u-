import { useCallback, useEffect, useState } from "react";
import Loader from "../loader/Loader";
import apiRequest from "../../lib/apiRequest";
import { formatDateTime } from "../../lib/formatPhone";
import "./adminMisses.scss";

const RANGES = [
  { days: 7, label: "Son 7 gün" },
  { days: 30, label: "Son 30 gün" },
  { days: 90, label: "Son 90 gün" },
];

const cap = (s) => (s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s);
const keyOf = (m) => `${m.city || ""}|${m.district || ""}|${m.label}`;

// Yönetici: asistanın sonuç bulamadığı aramalar. Hangi ilçede hangi tür işletme
// eksik, en çok arananlar üstte. Eksik giderilince "Giderdim" ile listeden kalkar.
function AdminMisses() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest.get(`/assistant/admin/misses?days=${days}`);
      setItems(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError("Aramalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const clear = async (m) => {
    const place = [m.district, m.city].filter(Boolean).join(", ") || "tüm yerler";
    if (!window.confirm(`"${m.label}" (${place}) aramaları listeden kaldırılacak. Devam edilsin mi?`))
      return;
    setBusyKey(keyOf(m));
    setError("");
    try {
      await apiRequest.post("/assistant/admin/misses/clear", {
        city: m.city,
        district: m.district,
        label: m.label,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="adminMiss">
      <div className="adminMissHead">
        <h2>Bulunamayan aramalar</h2>
        <p>
          Kullanıcıların asistanda aradığı ama kayıtlı işletme bulunamayan tür ve ilçeler. Kimlik
          bilgisi saklanmaz. Yeni işletme ekleme önceliğini buradan belirleyebilirsiniz.
        </p>
      </div>

      <div className="missChips">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className={days === r.days ? "active" : ""}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {total > 0 && <p className="missTotal">Toplam {total} bulunamayan arama</p>}
      {error && <p className="missError">{error}</p>}
      {loading && <Loader />}
      {!loading && !error && items.length === 0 && (
        <p className="missEmpty">Bu aralıkta bulunamayan arama yok.</p>
      )}

      <div className="missList">
        {items.map((m) => {
          const place = [m.district, m.city].filter(Boolean).join(", ");
          return (
            <article key={keyOf(m)} className="missRow">
              <div className="missCount">
                <strong>{m.count}</strong>
                <small>arama</small>
              </div>
              <div className="missBody">
                <h3>{cap(m.label || "Tür belirtilmemiş")}</h3>
                <p>{place || "Yer belirtilmemiş"}</p>
                <small>Son arama: {formatDateTime(m.lastAt)}</small>
              </div>
              <button
                type="button"
                className="missDone"
                disabled={busyKey === keyOf(m)}
                onClick={() => clear(m)}
              >
                Giderdim
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default AdminMisses;
