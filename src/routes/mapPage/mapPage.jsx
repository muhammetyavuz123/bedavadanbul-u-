import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import apiRequest from "../../lib/apiRequest";
import Map from "../../components/map/Map";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import Loader from "../../components/loader/Loader";
import { FiInbox } from "react-icons/fi";
import "./mapPage.scss";

// ⚠️ Mobil uygulamadaki "Haritada Gör" (PostsMap) ekranının web karşılığı.
// Mobilde bu ekran WebView içine gömülü bir Leaflet HTML'i kullanıyordu
// (RN'de native harita bileşeni yok); web'de zaten react-leaflet tabanlı bir
// <Map/> bileşenimiz var (components/map/Map.jsx — şu an singlePage'de tek
// bir ilanın konumunu göstermek için kullanılıyor), o yüzden burada aynı
// bileşene onaylı ve konumu (latitude/longitude) tanımlı TÜM ilanları
// (geniş bir limitle, sayfalama olmadan) geçiyoruz. Mobildeki gibi
// kullanıcının kendi konumuna otomatik odaklanma (expo-location) burada
// kapsam dışı bırakıldı — web'de bu, ayrı bir izin akışı gerektiriyor ve
// istenen özellik sadece "tüm postları haritada göster" idi.
function MapPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get("/posts?approved=true&limit=300");
        const items = res.data?.data || [];
        const withCoords = items.filter(
          (p) =>
            p.latitude != null &&
            p.longitude != null &&
            !Number.isNaN(Number(p.latitude)) &&
            !Number.isNaN(Number(p.longitude)),
        );
        if (!cancelled) setPosts(withCoords);
      } catch (err) {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Haritada Kampanyalar | BedavadanBul.com</title>
        <meta
          name="description"
          content="Tüm kampanyaları harita üzerinde keşfet, sana en yakın fırsatları anında gör."
        />
      </Helmet>

      <Breadcrumb
        title="Haritada Kampanyalar"
        breadcrumbText="Anasayfa / Harita"
        backgroundImage={BreadcrumbImage}
      />

      <div className="map-page-container">
        {loading ? (
          <div className="mapLoading">
            <Loader name="KampanyadanBul.com" />
          </div>
        ) : posts.length === 0 ? (
          <div className="emptyState">
            <FiInbox className="emptyIcon" />
            <p>Konumu tanımlı kampanya bulunamadı.</p>
          </div>
        ) : (
          <>
            <p className="resultCount">{posts.length} kampanya haritada</p>
            <div className="mapWrap">
              <Map items={posts} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default MapPage;
