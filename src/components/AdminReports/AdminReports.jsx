import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../loader/Loader";
import apiRequest from "../../lib/apiRequest";
import { formatDateTime } from "../../lib/formatPhone";
import "./adminReports.scss";

const TABS = [
  { key: "open", label: "Açık" },
  { key: "resolved", label: "Çözüldü" },
  { key: "dismissed", label: "Yoksayıldı" },
];

const TARGET_LABEL = {
  review: "İşletme yorumu",
  comment: "Kampanya yorumu",
  business: "İşletme",
  user: "Kullanıcı",
};

const PAGE_SIZE = 15;

// Yönetici: kullanıcı şikâyetlerini incele; içeriği kaldır, yoksay ya da çözüldü işaretle
function AdminReports() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest.get(
        `/reports/admin/all?status=${status}&page=${page}&limit=${PAGE_SIZE}`,
      );
      setItems(res.data.data);
      setTotal(res.data.total);
      setOpenCount(res.data.open || 0);
    } catch {
      setError("Şikâyetler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (r, action) => {
    if (action === "remove") {
      const msg =
        r.targetType === "business"
          ? "İşletme yayından kaldırılacak. Devam edilsin mi?"
          : "İçerik kalıcı olarak silinecek. Devam edilsin mi?";
      if (!window.confirm(msg)) return;
    }
    setBusyId(r.id);
    setError("");
    try {
      await apiRequest.post(`/reports/admin/${r.id}/resolve`, { action });
      // Aynı içeriğe gelen diğer şikâyetler de kapanır; listeyi yeniden çek
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="adminRep">
      <div className="adminRepHead">
        <h2>Şikâyetler</h2>
        <p>
          Kullanıcıların bildirdiği yorum, kampanya yorumu ve işletmeleri inceleyin. Uygunsuz
          içeriği kaldırabilir ya da şikâyeti yoksayabilirsiniz. Karar verildiğinde şikâyet eden
          kişiye bildirim gider.
        </p>
      </div>

      <div className="repChips">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={status === t.key ? "active" : ""}
            onClick={() => {
              setPage(1);
              setStatus(t.key);
            }}
          >
            {t.label}
            {t.key === "open" && openCount > 0 && <span className="countDot">{openCount}</span>}
          </button>
        ))}
      </div>

      {error && <p className="repError">{error}</p>}
      {loading && <Loader />}
      {!loading && items.length === 0 && <p className="repEmpty">Bu listede şikâyet yok.</p>}

      <div className="repList">
        {items.map((r) => {
          const canRemove = r.targetType !== "user" && !!r.preview;
          return (
            <article key={r.id} className="repRow">
              <div className="repTop">
                <span className="reasonTag">{r.reasonLabel}</span>
                <small>{TARGET_LABEL[r.targetType] || r.targetType}</small>
              </div>

              <div className="repPreview">
                {r.preview ? (
                  <>
                    <p>{r.preview.text}</p>
                    {r.preview.extra && <small>{r.preview.extra}</small>}
                    {r.preview.businessId && (
                      <Link to={`/isletme/${r.preview.businessId}`} target="_blank">
                        Sayfayı aç
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="gone">İçerik artık mevcut değil.</p>
                )}
              </div>

              <div className="repMeta">
                {r.reportedUser && <span>İçerik sahibi: {r.reportedUser.username}</span>}
                <span>
                  Şikâyet eden: {r.reporter?.username || "—"} · {formatDateTime(r.createdAt)}
                </span>
                {r.details && <span>Açıklama: {r.details}</span>}
              </div>

              {status === "open" && (
                <div className="repActions">
                  {canRemove ? (
                    <button
                      type="button"
                      className="danger solid"
                      disabled={busyId === r.id}
                      onClick={() => act(r, "remove")}
                    >
                      İçeriği kaldır
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="approve"
                      disabled={busyId === r.id}
                      onClick={() => act(r, "resolve")}
                    >
                      Çözüldü
                    </button>
                  )}
                  <button type="button" disabled={busyId === r.id} onClick={() => act(r, "dismiss")}>
                    Yoksay
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="repPager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Önceki
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
