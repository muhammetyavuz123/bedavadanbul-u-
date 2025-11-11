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
      {/* <div className="homePage">
        <div className="textContainer">
          <div className="wrapper">
            <h1 className="title">Aradığın Kampanya & Beklediğin İndirim</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos
              explicabo suscipit cum eius, iure est nulla animi consequatur
              facilis id pariatur fugit quos laudantium temporibus dolor ea
              repellat provident impedit!
            </p>
            <SearchBar />
            <div className="boxes">
              <div className="box">
                <h1>7600</h1>
                <h2>Kampanya</h2>
              </div>
              <div className="box">
                <h1>8000</h1>
                <h2>İşletme</h2>
              </div>
              <div className="box">
                <h1>40</h1>
                <h2>Şehir</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="imgContainer">
          <img src="/bg.png" alt="" />
        </div>
      </div> */}
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

        <Carusel></Carusel>
      </section>
      {/* <div style={{ padding: 20 }}>
        <CategoryCard />
      </div> */}
      <AppBanner />

      <main className="content-list">
        <h1 style={{ margin: "25px 0px" }}>En yeni Kampanyalar</h1>
        <div className="product-grid-list">
          <Suspense fallback={<Loader name="KampanyadanBul" />}>
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
