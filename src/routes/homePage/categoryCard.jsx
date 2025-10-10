import React from "react";
import "./categoryCard.scss";
import bim from "../../assets/bim.png";
import a101 from "../../assets/a101.png";
import sok from "../../assets/sok.jpg";
import koop from "../../assets/koop.png";

const cards = [
  {
    id: 1,
    title: "Bim",
    subtitle: "Aktüel Ürünler",
    img: bim,
  },
  {
    id: 2,
    title: "A101",
    subtitle: "Aktüel Ürünler",
    img: a101,
  },
  {
    id: 3,
    title: "Şok",
    subtitle: "Aktüel Ürünler",
    img: sok,
  },
  {
    id: 4,
    title: "Tarım Kredi Kooperatifi",
    subtitle: "Aktüel Ürünler",
    img: koop,
  },
];

export default function CategoryCard() {
  return (
    <section className="cg-wrapper">
      <h2 className="cg-title">Market Aktüel Kategori</h2>
      <div className="cg-scroll-area">
        <div className="cg-grid">
          {cards.map((c) => (
            <div className="cg-card" key={c.id}>
              <div className="cg-img-wrapper">
                <img src={c.img} alt={c.title} />
                <div className="cg-overlay">
                  <h3>{c.title}</h3>
                  <p>{c.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
