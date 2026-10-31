import { Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import CategoryCard from "./categoryCard";
import Carusel from "./carusel";
import Banner from "../../components/Banner/banner";
import AppBanner from "../../components/AppBanner/AppBanner";
import BusinessShowcase from "../../components/BusinessShowcase/BusinessShowcase";
import { Await, Link, useLoaderData } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import {
  FiArrowRight,
  FiBell,
  FiCoffee,
  FiHeart,
  FiHome,
  FiInbox,
  FiMapPin,
  FiPhoneCall,
  FiScissors,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiUser,
  FiZap,
} from "react-icons/fi";
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

// Başlıktaki "Aradığın ___ Burada" kısmında dönen kelimeler.
// Tüm kelimeler aynı grid hücresinde üst üste durur: genişlik en uzun
// kelimeye göre sabitlenir, böylece değişirken satır kaymaz.
const HERO_WORDS = [
  "İşletme",
  "Berber",
  "Kafe",
  "Restoran",
  "Usta",
  "Kuaför",
  "Market",
];

function HeroHeadline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    // Hareketi azaltmayı seçen kullanıcılarda kelime sabit kalır
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  const prev = (i - 1 + HERO_WORDS.length) % HERO_WORDS.length;

  return (
    <h1 className="heroTitle" aria-label="Beklediğin İndirim & Aradığın İşletme Burada">
      <span className="heroLine" aria-hidden="true">
        Beklediğin <span className="shine">İndirim</span> &amp;
      </span>
      <span className="heroLine" aria-hidden="true">
        Aradığın{" "}
        <span className="wordSwap">
          {HERO_WORDS.map((w, n) => (
            <span
              key={w}
              className={`word ${n === i ? "on" : n === prev ? "off" : ""}`}
            >
              {w}
            </span>
          ))}
        </span>{" "}
        Burada
      </span>
    </h1>
  );
}

// Hero sağ alan: uygulamayı anlatan telefon çizimi. Görsel dosya yok, tamamı
// kodla çizilir; etrafındaki rozetler uygulamanın ana özelliklerini sayar.
function HeroPhone() {
  return (
    <div className="heroPhone" aria-hidden="true">
      <span className="phoneRing r1" />
      <span className="phoneRing r2" />

      <div className="phoneChip c1">
        <span className="chipIcon red">
          <FiTag />
        </span>
        <span>
          <b>Kampanyalar</b>
          <small>Yakınındaki fırsatlar</small>
        </span>
      </div>
      <div className="phoneChip c2">
        <span className="chipIcon amber">
          <FiStar />
        </span>
        <span>
          <b>Puan ve yorum</b>
          <small>Gerçek deneyimler</small>
        </span>
      </div>
      <div className="phoneChip c3">
        <span className="chipIcon green">
          <FiPhoneCall />
        </span>
        <span>
          <b>Tek dokunuşla ara</b>
          <small>Direkt işletmeye ulaş</small>
        </span>
      </div>
      <div className="phoneChip c4">
        <span className="chipIcon blue">
          <FiMapPin />
        </span>
        <span>
          <b>Haritada keşfet</b>
          <small>Sana en yakın olan</small>
        </span>
      </div>

      <div className="phoneBody">
        <div className="phoneNotch" />
        <div className="phoneScreen">
          <div className="appTop">
            <div className="appBar">
              <span className="appLogo">B</span>
              <span className="appBrand">BedavadanBul</span>
              <span className="appBell">
                <FiBell />
              </span>
            </div>
            <div className="appSearch">
              <FiSearch /> Berber, kafe, usta ara
            </div>
            <div className="appChips">
              <span className="on">Kampanyalar</span>
              <span>İşletmeler</span>
              <span>Harita</span>
            </div>
          </div>

          <div className="appFeedClip">
            <div className="appFeed">
              <div className="appCard">
                <div className="appImg g1">
                  <i className="blob b1" />
                  <i className="blob b2" />
                  <FiScissors className="appGlyph" />
                  <em>2 gün kaldı</em>
                  <span className="appFav">
                    <FiHeart />
                  </span>
                </div>
                <div className="appInfo">
                  <b>Saç kesimi + sakal</b>
                  <small>Örnek Berber</small>
                  <span className="appRate">
                    <FiStar /> 4,8 <u>(32)</u>
                  </span>
                  <span className="appPrice">250₺</span>
                </div>
              </div>
              <div className="appCard">
                <div className="appImg g2">
                  <i className="blob b1" />
                  <i className="blob b2" />
                  <FiCoffee className="appGlyph" />
                  <em>Yeni</em>
                  <span className="appFav on">
                    <FiHeart />
                  </span>
                </div>
                <div className="appInfo">
                  <b>1 alana 1 bedava kahve</b>
                  <small>Örnek Kafe</small>
                  <span className="appRate">
                    <FiStar /> 4,6 <u>(18)</u>
                  </span>
                  <span className="appPrice">90₺</span>
                </div>
              </div>
              <div className="appCard">
                <div className="appImg g3">
                  <i className="blob b1" />
                  <i className="blob b2" />
                  <FiShoppingBag className="appGlyph" />
                  <em>5 gün kaldı</em>
                  <span className="appFav">
                    <FiHeart />
                  </span>
                </div>
                <div className="appInfo">
                  <b>Alışverişte %15 indirim</b>
                  <small>Örnek Market</small>
                  <span className="appRate">
                    <FiStar /> 4,9 <u>(51)</u>
                  </span>
                  <span className="appPrice">180₺</span>
                </div>
              </div>
            </div>
          </div>

          <div className="appNav">
            <FiHome className="on" />
            <FiMapPin />
            <FiHeart />
            <FiUser />
          </div>
        </div>
      </div>
    </div>
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
          <HeroHeadline />
          <p className="heroSub">
            Yakınındaki işletmeleri ve kampanyaları keşfet; en uygun fiyatı, en
            yakın ustayı saniyeler içinde bul.
          </p>

          <div className="filters">
            <SearchBar />
          </div>

          <Link to="/asistan" className="heroAssist">
            <span className="heroAssistIcon">
              <FiZap />
            </span>
            <span className="heroAssistText">
              <b>Asistana sor</b>
              <small>"Bayrampaşa'dayım, bir kafe önerir misin?"</small>
            </span>
            <FiArrowRight className="heroAssistGo" />
          </Link>

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
            <HeroPhone />
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

      <BusinessShowcase />
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
