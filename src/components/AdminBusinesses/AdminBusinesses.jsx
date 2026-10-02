import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Loader from "../loader/Loader";
import BizAvatar from "../BizAvatar/BizAvatar";
import { VerifiedBadge, FeaturedBadge } from "../BizBadges/BizBadges";
import apiRequest from "../../lib/apiRequest";
import "./adminBusinesses.scss";

const FILTERS = [
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
  const [filter, setFilter] = useState("");
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="adminBiz">
      <div className="adminBizHead">
        <h2>İşletmeler</h2>
        <p>
          Doğrulanmış rozeti verin, işletmeyi belirli bir süre öne çıkarın veya yayından kaldırın.
          Öne çıkan işletmeler listelerde ve anasayfa vitrininde en üstte görünür.
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
            </button>
          ))}
        </div>
      </form>

      {error && <p className="adminBizError">{error}</p>}
      {loading && <Loader />}

      {!loading && items.length === 0 && <p className="adminBizEmpty">İşletme bulunamadı.</p>}

      <div className="adminBizList">
        {items.map((b) => (
          <article key={b.id} className={`adminBizRow ${b.isActive ? "" : "inactive"}`}>
            <div className="rowMain">
              <span className="rowLogo">
                <BizAvatar name={b.name} logo={b.logo} />
              </span>
              <div className="rowInfo">
                <strong>
                  <Link to={`/isletme/${b.id}`} target="_blank">
                    {b.name}
                  </Link>{" "}
                  {b.isVerified && <VerifiedBadge compact />}
                </strong>
                <small>
                  {b.category?.name} · {b.district}, {b.city}
                </small>
                <small>
                  {b.owner?.username} · {b.owner?.email}
                </small>
                <div className="rowBadges">
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
                  {!b.isActive && <span className="offTag">Yayında değil</span>}
                </div>
              </div>
            </div>

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
          </article>
        ))}
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
