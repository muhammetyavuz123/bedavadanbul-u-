import { useEffect, useState } from "react";
import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import apiRequest from "../../lib/apiRequest";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import Loader from "../../components/loader/Loader";
import { useSearchParams } from "react-router-dom";
import { useError } from "../../context/ErrorContext";
import { FiInbox, FiGift } from "react-icons/fi";
import LoyaltyProgramCard from "../../components/LoyaltyProgramCard/LoyaltyProgramCard";

function ListPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const city = searchParams.get("city");
  const district = searchParams.get("district");
  const search = searchParams.get("search");
  const { showError } = useError();

  // Sadakat programları: "Kampanyalar | Sadakat Programları" filtresi + kampanya listesinin üstünde şerit
  const [view, setView] = useState(searchParams.get("sadakat") === "1" ? "loyalty" : "campaigns");
  const [strip, setStrip] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [progPage, setProgPage] = useState(1);
  const [progMore, setProgMore] = useState(false);
  const [progLoading, setProgLoading] = useState(false);

  const loadPrograms = async (reset = false) => {
    setProgLoading(true);
    try {
      const pageNo = reset ? 1 : progPage;
      const res = await apiRequest.get("/loyalty/programs", {
        params: {
          page: pageNo,
          limit: 12,
          ...(city ? { city } : {}),
          ...(district ? { district } : {}),
          ...(search ? { search } : {}),
        },
      });
      const list = res.data?.programs || [];
      setPrograms((prev) => (reset ? list : [...prev, ...list]));
      setProgPage(pageNo + 1);
      setProgMore(!!res.data?.hasMore);
    } catch {
      showError("Sadakat programları yüklenemedi.");
    } finally {
      setProgLoading(false);
    }
  };

  // Şerit: filtreye uyan ilk birkaç program (sessiz; hata olursa şerit görünmez)
  useEffect(() => {
    let alive = true;
    apiRequest
      .get("/loyalty/programs", {
        params: {
          limit: 6,
          ...(city ? { city } : {}),
          ...(district ? { district } : {}),
          ...(search ? { search } : {}),
        },
      })
      .then((r) => alive && setStrip(r.data?.programs || []))
      .catch(() => alive && setStrip([]));
    return () => {
      alive = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (view === "loyalty") loadPrograms(true);
  }, [view, searchParams]);

  // 🔥 Filtreli veri yükleme fonksiyonu
  const loadPosts = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;

      // Arama parametrelerini API isteğine ekle
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        approved: "true",
      });

      if (categoryId) query.append("categoryId", categoryId);
      if (city) query.append("city", city);
      if (district) query.append("district", district);
      if (search) query.append("search", search); // search parametresi ekleniyor

      const res = await apiRequest.get(`/posts?${query.toString()}`);
      const newPosts = res.data.data;

      if (reset) {
        setPosts(newPosts);
        setPage(2);
        setHasMore(newPosts.length > 0);
      } else {
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setPage((prev) => prev + 1);
        }
      }
    } catch (err) {
      showError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 search param değiştiğinde veya temizlendiğinde filtreli veri çek
  useEffect(() => {
    setPage(1);
    setHasMore(true);

    // Eğer search parametre boşsa, tüm verileri yükle
    loadPosts(true); // search temizlendiğinde de otomatik olarak yükle
  }, [searchParams]); // searchParams değiştiğinde veri yenilenmeli

  return (
    <>
      <Breadcrumb
        title="Kampanyalar"
        breadcrumbText="Anasayfa / Kampanyalar"
        backgroundImage={BreadcrumbImage}
      />
      <div className="page-container">
        <aside className="sidebarContent">
          <Filter />
        </aside>

        <main className="content-list">
          <div className="viewTabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === "campaigns"}
              className={view === "campaigns" ? "active" : ""}
              onClick={() => setView("campaigns")}
            >
              Kampanyalar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "loyalty"}
              className={view === "loyalty" ? "active" : ""}
              onClick={() => setView("loyalty")}
            >
              <FiGift /> Sadakat Programları
            </button>
          </div>

          {view === "loyalty" ? (
            <>
              <div className="product-grid-list">
                {programs.map((p) => (
                  <LoyaltyProgramCard key={p.id} program={p} />
                ))}
              </div>
              <div className="listStatus">
                {progLoading && <Loader />}
                {!progLoading && progMore && (
                  <button onClick={() => loadPrograms(false)} className="load-more-button">
                    Daha Fazla Yükle
                  </button>
                )}
                {!progLoading && programs.length === 0 && (
                  <div className="emptyState">
                    <FiGift className="emptyIcon" />
                    <p>Bu bölgede henüz sadakat programı yok.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
          {strip.length > 0 && (
            <section className="loyaltyStrip">
              <div className="stripHead">
                <h3>
                  <FiGift /> Sadakat Programları
                </h3>
                <button type="button" onClick={() => setView("loyalty")}>
                  Tümünü gör
                </button>
              </div>
              <div className="stripRow">
                {strip.map((p) => (
                  <LoyaltyProgramCard key={p.id} program={p} compact />
                ))}
              </div>
            </section>
          )}

          <div className="product-grid-list">
            {posts.map((post) => (
              <Card key={post.id} item={post} />
            ))}
          </div>

          {/* 📦 Pagination veya durum mesajları */}
          <div className="listStatus">
            {loading && <Loader />}

            {!loading && posts.length > 0 && hasMore && (
              <button
                onClick={() => loadPosts(false)}
                disabled={loading}
                className="load-more-button"
              >
                Daha Fazla Yükle
              </button>
            )}

            {!loading && !hasMore && posts.length > 0 && (
              <p className="allShownText">Tüm kampanyalar gösteriliyor.</p>
            )}

            {!loading && posts.length === 0 && (
              <div className="emptyState">
                <FiInbox className="emptyIcon" />
                <p>İl ve ilçeye ait kampanya bulunamadı.</p>
              </div>
            )}
          </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default ListPage;
