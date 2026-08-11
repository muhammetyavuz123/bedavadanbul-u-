import React from "react";
import "./banner.scss";
import { Link } from "react-router-dom";

// ⚠️ Props opsiyonel ve varsayılanlar eski (sabit) metinlerle aynı — mevcut
// `<Banner />` kullanımı (anasayfa altındaki kırmızı banner) hiç değişmeden
// çalışmaya devam eder. Yeni kullanım yerleri (ör. anasayfanın ortasındaki
// tanıtım kartı) kendi title/subtitle/buttonText/to değerlerini geçebilir.
const Banner = ({
  title = "Türkiyenin indirimi",
  subtitle = "Kaliteli ürünler şimdi çok daha uygun fiyatlarla.",
  buttonText = "İncele",
  to = "/list",
}) => {
  return (
    <section className="thin-hero-banner">
      <div className="thin-banner-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <Link to={to}>
          {" "}
          <button>{buttonText}</button>
        </Link>
      </div>
    </section>
  );
};

export default Banner;
