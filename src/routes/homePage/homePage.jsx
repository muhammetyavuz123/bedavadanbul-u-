import { Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import w from "../../assets/ee.png";
import CategoryCard from "./categoryCard";
import Carusel from "./carusel";
import Banner from "../../components/Banner/banner";
import AppBanner from "../../components/AppBanner/AppBanner";
import { Await, Link, useLoaderData } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import { FiInbox, FiMapPin } from "react-icons/fi";
import { useCategories } from "../../lib/useCategories";

// ⚠️ GERÇEK NEDEN: react-slick'te `slidesToShow` prop'u gerçek slide
// sayısından FAZLA olduğunda ve `infinite: false` olduğunda, kütüphane
// track/slide genişliklerini yanlış hesaplıyor (bilinen bir react-slick
// edge-case'i) — bizim durumumuzda masaüstünde slidesToShow=4 isteniyordu
// ama sadece 3 "öne çıkan" kampanya vardı, bu yüzden kartlar sıkışık/dar
// render oluyordu. Kategoriler carousel'i (carusel.jsx) bu duruma hiç
// düşmüyor çünkü orada her zaman en az 8 sabit kategori var (slidesToShow
// en fazla 4). Çözüm: slidesToShow'u asla gerçek kart sayısından fazla
// istemiyoruz.
function FeaturedCarousel({ featured, slidesToShow }) {
  const effectiveSlidesToShow = Math.min(slidesToShow, featured.length);

  return (
    <Slider
      // key: breakpoint (mobil/tablet/masaüstü) değiştiğinde slider'ı
      // sıfırdan mount ediyoruz ki genişlik ölçümü güncel DOM üzerinden
      // tazelensin.
      key={effectiveSlidesToShow}
      dots={false}
      infinite={false}
      speed={400}
      arrows={featured.length > effectiveSlidesToShow}
      slidesToScroll={1}
      slidesToShow={effectiveSlidesToShow}
    >
      {featured.map((post) => (
        <div key={post.id} className="product-slide">
          <Card item={post} />
        </div>
      ))}
    </Slider>
  );
}

function HomePage() {
  const data = useLoaderData();
  const categories = useCategories();
  const quickCategories = categories.filter((c) => !c.parentId).slice(0, 6);

  // ⚠️ FIX: "Öne Çıkan Kampanyalar" kartları eskiden bir CSS grid içindeydi
  // (auto-fill, minmax(250px,1fr)) — dar bir kapsayıcıda (ör. dar bir
  // pencere/mobil görünüm) bu grid tek sütuna düşüp kartları alt alta
  // diziyordu. Kategoriler bölümünde zaten kullanılan react-slick ile aynı
  // yatay kaydırmalı carousel deseni uygulanıyor, tutarlılık için.
  const getFeaturedSlidesToShow = () => {
    if (window.innerWidth < 640) return 1.15; // mobil: bir sonraki kart kenardan görünsün
    if (window.innerWidth < 1024) return 2.2; // tablet
    return 4; // desktop
  };
  const [featuredSlides, setFeaturedSlides] = useState(null);

  useEffect(() => {
    setFeaturedSlides(getFeaturedSlidesToShow());
    const handleResize = () => setFeaturedSlides(getFeaturedSlidesToShow());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Helmet>
        <title>
          BedavadanBul.com | Kampanyalar, İndirimler ve Fırsatlar Bir Arada
        </title>
        <meta
          name="description"
          content="Binlerce işletmenin kampanya ve indirimlerini keşfet, kategoriye ve şehre göre filtrele, en avantajlı fırsatı bedavadanBul.com'da bul."
        />
      </Helmet>

      <section className="hero">
        <div className="hero-left">
          <h1>Beklediğin Kampanya & Beklediğin İndirim Burada</h1>
          <p>
            Aradığın her şeyi indirimli bulma fırsatını kaçırma -
            bedavadanBul.com
          </p>

          <div className="filters">
            <SearchBar />
          </div>

          {quickCategories.length > 0 && (
            <div className="quickCategories">
              {quickCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/list?categoryId=${cat.id}`}
                  className="quickChip"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <div className="heroStats">
            {/* <div className="statItem">
              <strong>5.000+</strong>
              <span>Aktif Kampanya</span>
            </div>
            <div className="statDivider" /> */}
            <div className="statItem">
              <strong>1.200+</strong>
              <span>İşletme</span>
            </div>
            <div className="statDivider" />
            <div className="statItem">
              <strong>50.000+</strong>
              <span>Mutlu Kullanıcı</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <img src={w} alt="Kadın" className="hero-woman" />

            <div className="deal-card discount">%70</div>
            <div className="deal-card price">%50</div>
            <div className="deal-card badge">%100</div>
            <div className="deal-card store">BedavadanBul</div>
            <div className="deal-card category">Herşey İndirimden</div>
            <div className="deal-card timer">⏳ Son 3 Saat</div>
          </div>
        </div>

        <a href="#categories" className="scrollHint">
          <span>Kategorileri Keşfet</span>
          <div className="chevron" />
        </a>
      </section>

      <div id="categories">
        <Carusel />
      </div>
      {/* <div style={{ padding: 20 }}>
        <CategoryCard />
      </div> */}
      <AppBanner />

      {/* ⚠️ Kullanıcı isteği: önce burada hem bir tanıtım banner'ı hem de
          altında canlı (Leaflet) bir harita önizlemesi vardı — ikisi de aynı
          /harita hedefini tanıtıyordu, üst üste tekrar gibi duruyordu ve
          küçültülmüş harita (Türkiye geneli zoom'da minik pin'ler) pek
          etkileyici görünmüyordu. Tek, tıklanabilir bir tanıtım kartıyla
          birleştirildi — mobildeki "Haritayı Aç" ile aynı hedef. */}
      <Link to="/harita" className="mapPromoCard">
        <div className="mapPromoIcon">
          <FiMapPin />
        </div>
        <div className="mapPromoText">
          <h2>Haritada Kampanyalar</h2>
          <p>
            Tüm kampanyaları harita üzerinde keşfet, sana en yakın fırsatı
            anında bul.
          </p>
          <span className="mapPromoCta">Haritayı Aç →</span>
        </div>
      </Link>

      <main className="content-list">
        <div className="sectionHeading">
          <h2>Öne Çıkan Kampanyalar</h2>
          <Link to="/list" className="viewAllLink">
            Tümünü Gör →
          </Link>
        </div>
        <div className="product-carousel">
          <Suspense fallback={<Loader name="KampanyadanBul.com" />}>
            <Await
              resolve={data?.postResponse}
              errorElement={<p>Kampanyalar yüklenirken bir hata oluştu.</p>}
            >
              {(postResponse) => {
                const featured = (postResponse?.data.data || [])
                  .filter((post) => post.listingType === "featured")
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 8);

                if (featured.length === 0) {
                  return (
                    <div className="emptyState">
                      <FiInbox className="emptyIcon" />
                      <p>
                        Henüz öne çıkan bir kampanya yok, çok yakında burada
                        olacak.
                      </p>
                    </div>
                  );
                }

                // slidesToShow width hesabı gelene kadar (ilk render) kartları
                // Slider'sız basıyoruz, aksi halde bir anlık layout sıçraması olur.
                if (!featuredSlides) return null;

                return (
                  <FeaturedCarousel
                    featured={featured}
                    slidesToShow={featuredSlides}
                  />
                );
              }}
            </Await>
          </Suspense>
        </div>
      </main>
      <Banner />

      {/* ⚠️ Kullanıcı isteği: en sona, banner'ın altına "Sona Erecek
          Kampanyalar" bölümü. Backend'e eklenen `sort=expiring` ile
          expireDate'i en yakın (en yakında sona erecek) onaylı ilanlar
          getiriliyor — aynı FeaturedCarousel/kart deseni tekrar kullanılıyor. */}
      <main className="content-list">
        <div className="sectionHeading">
          <h2>Sona Erecek Kampanyalar</h2>
          <Link to="/list" className="viewAllLink">
            Tümünü Gör →
          </Link>
        </div>
        <div className="product-carousel">
          <Suspense fallback={<Loader name="KampanyadanBul.com" />}>
            <Await
              resolve={data?.endingSoonResponse}
              errorElement={<p>Kampanyalar yüklenirken bir hata oluştu.</p>}
            >
              {(endingSoonResponse) => {
                const endingSoon = (endingSoonResponse?.data.data || []).slice(
                  0,
                  8,
                );

                if (endingSoon.length === 0) {
                  return (
                    <div className="emptyState">
                      <FiInbox className="emptyIcon" />
                      <p>Şu anda sona ermek üzere bir kampanya yok.</p>
                    </div>
                  );
                }

                if (!featuredSlides) return null;

                return (
                  <FeaturedCarousel
                    featured={endingSoon}
                    slidesToShow={featuredSlides}
                  />
                );
              }}
            </Await>
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default HomePage;
