import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "./carusel.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import saglik from "../../assets/saglik.svg";
import clothes from "../../assets/giyim.svg";
import home from "../../assets/home.svg";
import children from "../../assets/cocuk.svg";
import technology from "../../assets/teknoloji.svg";
import market from "../../assets/market.svg";
import egitim from "../../assets/egitim.svg";
import car from "../../assets/car.svg";

const categories = [
  { id: 1, name: "Eğitim", img: egitim },
  { id: 2, name: "Gıda", img: market },
  { id: 3, name: "Sağlık", img: saglik },
  { id: 4, name: "Giyim", img: clothes },
  { id: 5, name: "Ev & Yaşam", img: home },
  { id: 6, name: "Çocuk & Bebek", img: children },
  { id: 7, name: "Teknoloji & Elektronik", img: technology },
  { id: 8, name: "Araba Hizmetleri", img: car },
];

const CategoryCarousel = () => {
  const [slides, setSlides] = useState(null);
  const getSlidesToShow = () => {
    if (window.innerWidth < 768) return 2; // mobil
    if (window.innerWidth < 1024) return 3; // tablet
    return 4; // desktop
  };
  useEffect(() => {
    // 🔴 slider render edilmeden önce width hesaplanır
    setSlides(getSlidesToShow());

    const handleResize = () => {
      setSlides(getSlidesToShow());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔴 width gelmeden slider render olmaz
  if (!slides) return null;

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    arrows: true,
    slidesToScroll: 1,
    slidesToShow: slides, // 🔥 tek kaynak
  };

  return (
    <div className="category-carousel">
      <h2 className="carousel-title">Kategoriler</h2>
      <Slider {...settings}>
        {categories.map((cat) => (
          <div key={cat.id} className="category-item">
            <div className="category-card">
              <img src={cat.img} alt={cat.name} />
            </div>
            <span>{cat.name}</span>
          </div>
        ))}
      </Slider>
    </div>
  );
};
export default CategoryCarousel;
