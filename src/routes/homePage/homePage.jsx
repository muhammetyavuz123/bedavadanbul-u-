import { Suspense } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import w from "../../assets/ee.png";
import CategoryCard from "./categoryCard";
import Carusel from "./carusel";
import Banner from "../../components/Banner/banner";
import AppBanner from "../../components/AppBanner/AppBanner";
import { Await, useLoaderData } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";

function HomePage() {
  const data = useLoaderData();

  return (
    <>
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
      </section>

      <Carusel />
      {/* <div style={{ padding: 20 }}>
        <CategoryCard />
      </div> */}
      <AppBanner />

      <main className="content-list">
        <h2 style={{ marginBottom: "20px" }}>En yeni Kampanyalar</h2>
        <div className="product-grid-list">
          <Suspense fallback={<Loader name="KampanyadanBul.com" />}>
            <Await
              resolve={data?.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) =>
                postResponse?.data.data
                  .filter((post) => post.listingType === "featured")
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 8)
                  .map((post) => <Card key={post.id} item={post} />)
              }
            </Await>
          </Suspense>
        </div>
      </main>
      <Banner />
    </>
  );
}

export default HomePage;
