import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Loader from "../loader/Loader";
import BizAvatar from "../BizAvatar/BizAvatar";
import { VerifiedBadge, FeaturedBadge } from "../BizBadges/BizBadges";
import apiRequest from "../../lib/apiRequest";
import "./adminBusinesses.scss";

const FILTERS = [
  { key: "pending", label: "Onay bekleyen" },
  { key: "rejected", label: "Reddedilen" },
  { key: "", label: "Tümü" },
  { key: "unverified", label: "Doğrulanmamış" },
  { key: "verified", label: "Doğrulanmış" },
  { key: "featured", label: "Öne çıkan" },
  { key: "inactive", label: "Yayında değil" },
];

const PAGE_SIZE = 15;

// Yönetici: işletmeleri doğrula, öne çıkar, yayından kaldır
function AdminBusinesses() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectFor, setRejectFor] = useState(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [days, setDays] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (filter) q.set("filter", filter);
      if (query) q.set("search", query);
      const res = await apiRequest.get(`/businesses/admin/all?${q.toString()}`);
      setItems(res.data.data);
      setTotal(res.data.total);
      setPendingCount(res.data.pending || 0);
    } catch {
      setError("İşletmeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [page, filter, query]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id, payload) => {
    setBusyId(id);
    setError("");
    try {
      const res = await apiRequest.patch(`/businesses/admin/${id}`, payload);
      setItems((list) => list.map((b) => (b.id === id ? { ...b, ...res.data } : b)));
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  // Başvuruyu onayla / reddet
  const decide = async (id, action, body) => {
    setBusyId(id);
    setError("");
    try {
      const res = await apiRequest.post(`/businesses/admin/${id}/${action}`, body);
      if (filter === "pending") {
        setItems((list) => list.filter((b) => b.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setItems((list) => list.map((b) => (b.id === id ? { ...b, ...res.data } : b)));
      }
      setPendingCount((c) => Math.max(0, c - 1));
      setRejectFor(null);
      setReason("");
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="adminBiz">
      <div className="adminBizHead">
        <h2>İşletmeler</h2>
        <p>
          Yeni işletme başvurularını onaylayın ya da gerekçeyle reddedin. Onaylanan işletmelere
          doğrulanmış rozeti verebilir, belirli bir süre öne çıkarabilir veya yayından
          kaldırabilirsiniz. Rozet onaydan ayrıdır ve onaylı işletmelere verilir.
        </p>
      </div>

      <form
        className="adminBizTools"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
      >
        <div className="searchBox">
          <FiSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İşletme adı ara..."
          />
        </div>
        <div className="filterChips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={filter === f.key ? "active" : ""}
              onClick={() => {
                setPage(1);
                setFilter(f.key);
              }}
            >
              {f.label}
              {f.key === "pending" && pendingCount > 0 && (
                <span className="countDot">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="adminBizError">{error}</p>}
      {loading && <Loader />}

      {!loading && items.length === 0 && (
        <p className="adminBizEmpty">
          {filter === "pending" ? "Onay bekleyen başvuru yok." : "İşletme bulunamadı."}
        </p>
      )}

      <div className="adminBizList">
        {items.map((b) => {
          const awaiting = b.status === "pending" || b.status === "rejected";
          return (
            <article
              key={b.id}
              className={`adminBizRow ${b.isActive ? "" : "inactive"} ${awaiting ? "awaiting" : ""}`}
            >
              <div className="rowMain">
                <span className="rowLogo">
                  <BizAvatar name={b.name} logo={b.logo} />
                </span>
                <div className="rowInfo">
                  <strong>
                    {awaiting ? (
                      b.name
                    ) : (
                      <Link to={`/isletme/${b.id}`} target="_blank">
                        {b.name}
                      </Link>
                    )}{" "}
                    {b.isVerified && <VerifiedBadge compact />}
                  </strong>
                  <small>
                    {b.category?.name} · {b.district}, {b.city}
                  </small>
                  <small>
                    {b.owner?.username} · {b.owner?.email}
                  </small>
                  <div className="rowBadges">
                    {b.status === "pending" && <span className="stateTag pending">Onay bekliyor</span>}
                    {b.status === "rejected" && <span className="stateTag rejected">Reddedildi</span>}
                    {b.isFeatured && (
                      <>
                        <FeaturedBadge />
                        {b.featuredUntil && (
                          <small>
                            {new Date(b.featuredUntil).toLocaleDateString("tr-TR")} tarihine kadar
                          </small>
                        )}
                      </>
                    )}
                    {!b.isActive && !awaiting && <span className="offTag">Yayında değil</span>}
                  </div>

                  {awaiting && (
                    <dl className="appDetails">
                      <div>
                        <dt>Adres</dt>
                        <dd>{b.address}</dd>
                      </div>
                      <div>
                        <dt>Telefon</dt>
                        <dd>{b.phone}</dd>
                      </div>
                      {b.workingHours && (
                        <div>
                          <dt>Saatler</dt>
                          <dd>{b.workingHours}</dd>
                        </div>
                      )}
                      {b.website && (
                        <div>
                          <dt>Web</dt>
                          <dd>{b.website}</dd>
                        </div>
                      )}
                      {b.description && (
                        <div>
                          <dt>Açıklama</dt>
                          <dd>{b.description}</dd>
                        </div>
                      )}
                      {b.submittedAt && (
                        <div>
                          <dt>Başvuru</dt>
                          <dd>{new Date(b.submittedAt).toLocaleString("tr-TR")}</dd>
                        </div>
                      )}
                      {b.status === "rejected" && b.rejectReason && (
                        <div>
                          <dt>Gerekçe</dt>
                          <dd>{b.rejectReason}</dd>
                        </div>
                      )}
                      {b.photos?.length > 0 && (
                        <div className="appPhotos">
                          {b.photos.map((p, i) => (
                            <img key={p + i} src={p} alt={`Fotoğraf ${i + 1}`} />
                          ))}
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </div>

              {awaiting ? (
                <div className="rowActions decide">
                  {rejectFor === b.id ? (
                    <div className="rejectBox">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        maxLength={300}
                        placeholder="Red gerekçesi (işletme sahibine gösterilir)"
                      />
                      <div className="rejectBtns">
                        <button
                          type="button"
                          className="danger solid"
                          disabled={busyId === b.id || reason.trim().length < 3}
                          onClick={() => decide(b.id, "reject", { reason: reason.trim() })}
                        >
                          Reddi gönder
                        </button>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => {
                            setRejectFor(null);
                            setReason("");
                          }}
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="approve"
                        disabled={busyId === b.id}
                        onClick={() => decide(b.id, "approve")}
                      >
                        Onayla ve yayına al
                      </button>
                      {b.status === "pending" && (
                        <button
                          type="button"
                          className="danger"
                          disabled={busyId === b.id}
                          onClick={() => {
                            setRejectFor(b.id);
                            setReason("");
                          }}
                        >
                          Reddet
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="rowActions">
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    className={b.isVerified ? "on" : ""}
                    onClick={() => update(b.id, { isVerified: !b.isVerified })}
                  >
                    {b.isVerified ? "Doğrulamayı kaldır" : "Doğrula"}
                  </button>

                  {b.isFeatured ? (
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      className="on"
                      onClick={() => update(b.id, { isFeatured: false })}
                    >
                      Öne çıkarmayı kaldır
                    </button>
                  ) : (
                    <span className="featureSet">
                      <select
                        value={days[b.id] || 30}
                        onChange={(e) => setDays((d) => ({ ...d, [b.id]: Number(e.target.value) }))}
                        aria-label="Öne çıkarma süresi"
                      >
                        <option value={7}>7 gün</option>
                        <option value={30}>30 gün</option>
                        <option value={90}>90 gün</option>
                        <option value={365}>1 yıl</option>
                      </select>
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => update(b.id, { isFeatured: true, featuredDays: days[b.id] || 30 })}
                      >
                        Öne çıkar
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={busyId === b.id}
                    className={b.isActive ? "danger" : ""}
                    onClick={() => {
                      if (
                        b.isActive &&
                        !window.confirm(`"${b.name}" yayından kaldırılsın mı? Profil herkese kapanır.`)
                      )
                        return;
                      update(b.id, { isActive: !b.isActive });
                    }}
                  >
                    {b.isActive ? "Yayından kaldır" : "Yayına al"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="adminBizPager">
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

export default AdminBusinesses;
