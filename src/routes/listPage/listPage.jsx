import { useEffect, useState } from "react";
import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import apiRequest from "../../lib/apiRequest";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import Loader from "../../components/loader/Loader";

function ListPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await apiRequest.get(
        `/posts?page=${page}&limit=10&approved=true`
      );
      const newPosts = res.data.data;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Veriler alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(); // Sayfa ilk yüklendiğinde çalışır
  }, []);

  return (
    <>
      <Breadcrumb
        title="Kampanyalar"
        breadcrumbText="Anasayfa / Kampanyalar"
        backgroundImage={BreadcrumbImage}
      />
      <div className="page-container">
        <aside className="sidebarContent">
          <h2 style={{ color: "white" }}>Arama</h2>
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

          {/* Daha Fazla Yükle Butonu */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            {hasMore ? (
              loading ? (
                <Loader />
              ) : (
                <button
                  onClick={loadPosts}
                  disabled={loading}
                  className="load-more-button"
                >
                  {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                </button>
              )
            ) : (
              <p style={{ marginTop: "10px" }}>
                Gösterilecek başka içerik yok.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default ListPage;
