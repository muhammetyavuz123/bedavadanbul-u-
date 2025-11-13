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

function ListPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const district = searchParams.get("district");
  const search = searchParams.get("search");
  const { showError } = useError();

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

      if (type) query.append("type", type);
      if (city) query.append("city", city);
      if (district) query.append("district", district);

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
      showError(" Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 search param değiştiğinde filtreli veri çek
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadPosts(true); // reset ile baştan yükle
  }, [type, city, district]);

  return (
    <>
      <Breadcrumb
        title="Kampanyalar"
        breadcrumbText="Anasayfa / Kampanyalar"
        backgroundImage={BreadcrumbImage}
      />
      <div className="page-container">
        <aside className="sidebarContent">
          <h2
            style={{
              color: "#ff3c38",
              marginLeft: "20px",
              marginBottom: "20px",
            }}
          >
            Arama
          </h2>
          <div className="filter-group">
            <Filter />
          </div>
        </aside>

        <main className="content-list">
          <div className="product-grid-list">
            {posts.map((post) => (
              <Card key={post.id} item={post} />
            ))}
          </div>

          {/* 📦 Pagination veya durum mesajları */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
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
              <p style={{ marginTop: "10px" }}>Tüm Kampanyalar Gösteriliyor.</p>
            )}

            {!loading && posts.length === 0 && (
              <p>İl ve ilçeye ait kampanya bulunamadı.</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default ListPage;
