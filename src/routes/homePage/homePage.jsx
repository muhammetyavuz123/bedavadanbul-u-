import { Suspense } from "react";
import { Helmet } from "react-helmet-async";
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
import { FiInbox } from "react-icons/fi";
import { useCategories } from "../../lib/useCategories";

function HomePage() {
  const data = useLoaderData();
  const categories = useCategories();
  const quickCategories = categories.filter((c) => !c.parentId).slice(0, 6);

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
            <div className="statItem">
              <strong>5.000+</strong>
              <span>Aktif Kampanya</span>
            </div>
            <div className="statDivider" />
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

      <main className="content-list">
        <div className="sectionHeading">
          <h2>Öne Çıkan Kampanyalar</h2>
          <Link to="/list" className="viewAllLink">
            Tümünü Gör →
          </Link>
        </div>
        <div className="product-grid-list">
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
                      <p>Henüz öne çıkan bir kampanya yok, çok yakında burada olacak.</p>
                    </div>
                  );
                }

                return featured.map((post) => (
                  <Card key={post.id} item={post} />
                ));
              }}
            </Await>
          </Suspense>
        </div>
      </main>
      <Banner />
    </>
  );
}

export default HomePage;
