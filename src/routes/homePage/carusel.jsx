import React from "react";
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
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 2,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2, arrows: false } },
    ],
  };

  return (
    <div className="category-carousel">
      <h2 className="carousel-title">Kategoriler</h2>
      <Slider {...settings}>
        {categories.map((cat) => (
          <div className="category-item" key={cat.id}>
            <div className="category-card">
              <div className="icon-wrapper">
                <img src={cat.img} alt={cat.name} />
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CategoryCarousel;
