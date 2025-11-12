import React from "react";
import "./banner.scss";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <section className="thin-hero-banner">
      <div className="thin-banner-content">
        <h1>Türkiyenin indirimi</h1>
        <p>Kaliteli ürünler şimdi çok daha uygun fiyatlarla.</p>
        <Link to="/list">
          {" "}
          <button>İncele</button>
        </Link>
      </div>
    </section>
  );
};

export default Banner;
