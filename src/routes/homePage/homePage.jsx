import { useContext, Suspense } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";
import w from "../../assets/ww.png";
import CategoryCard from "./categoryCard";
import Carusel from "./carusel";
import Banner from "../../components/Banner/banner";
import AppBanner from "../../components/AppBanner/AppBanner";
import { Await, useLoaderData } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";

function HomePage() {
  const data = useLoaderData();

  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <div className="hero-left">
            <h1>Beklediğin Kampanya & Beklediğin İndirim Burada</h1>
            <p>
              Aradığın Herşeyi İndirimli Bulma Fırsatını Kaçırma
              bedavadanBul.com
            </p>

            <div className="filters">
              <SearchBar />
            </div>
          </div>

          <div className="hero-right">
            <img src={w} alt="hero" />
          </div>
        </div>

        <Carusel />
      </section>
      {/* <div style={{ padding: 20 }}>
        <CategoryCard />
      </div> */}
      <AppBanner />

      <main className="content-list">
        <h1 className="subTitle">En yeni Kampanyalar</h1>
        <div className="product-grid-list">
          <Suspense fallback={<Loader name="KampanyadanBul.com" />}>
            <Await
              resolve={data?.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) =>
                postResponse?.data.data
                  .slice(-8)
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
