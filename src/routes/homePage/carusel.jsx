// src/components/CategoryCarousel.jsx
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
  { id: 7, name: "Tekloloji & Elektronik", img: technology },
  { id: 7, name: "Araba Hizmetleri", img: car },
];

const Carusel = () => {
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4, slidesToScroll: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 3, slidesToScroll: 1 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <>
      <div className="category-carousel">
        <Slider {...settings}>
          {categories.map((cat) => (
            <div className="category-item" key={cat.id}>
              <div className="image-wrapper">
                <img src={cat.img} alt={cat.name} />
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default Carusel;
