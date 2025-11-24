import React, { useEffect, useRef, useState } from "react";
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
  const [sliderKey, setSliderKey] = useState(0);
  const sliderRef = useRef();

  useEffect(() => {
    // Yeniden render zorlamak için resize sonrası Slick’i yeniden oluştur
    const handleResize = () => {
      setSliderKey((prev) => prev + 1);
    };
    window.addEventListener("resize", handleResize);

    // Sayfa yüklenince de Slick doğru boyutu hesaplasın
    setTimeout(() => {
      setSliderKey((prev) => prev + 1);
    }, 100);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
  return (
    <div className="category-carousel">
      <h2 className="carousel-title">Kategoriler</h2>
      <Slider ref={sliderRef} {...settings}>
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
