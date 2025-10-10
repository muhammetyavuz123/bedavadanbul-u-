import React from "react";
import "./AboutUs.scss";
import abouth from "../../assets/abouth.png";

const AboutUs = ({
  title = "Hakkımızda",
  subtitle = "Türkiyenin Reklamı",
  content = `Bedavadanbul.com, büyükten küçüğe her türlü işletmenin ürün ve hizmetlerini il ve ilçe bazında duyurabildiği, kullanıcıların ise indirim ve kampanyaları kolayca keşfedebildiği yenilikçi bir platformdur.
Amacımız, işletmeler ile müşteriler arasında doğrudan ve hızlı bir iletişim köprüsü kurarak, herkes için avantajlı fırsatları ulaşılabilir kılmaktır. Türkiye’nin dört bir yanındaki mağaza, kafe, restoran, market, hizmet sektörü ve daha birçok işletme; ürünlerini ve kampanyalarını Bedavadanbul.com’da paylaşarak, müşterilerine en iyi indirimleri sunar.
Kullanıcılar ise yaşadıkları bölgedeki güncel kampanyaları takip ederek, bütçelerine dost fırsatları kaçırmadan değerlendirebilir. Böylece hem işletmelerin bilinirliği artar hem de tüketiciler alışverişlerinde ekonomik avantajlar elde eder.
Bedavadanbul.com, yerel ekonomiyi güçlendirmek, alışverişi keyifli ve uygun fiyatlı hale getirmek için sürekli gelişen ve yenilenen bir platform olarak hizmetinizdedir.`,
}) => {
  return (
    <section className="about-us">
      <div className="about-us__content">
        <h2 className="about-us__title">{title}</h2>
        <h4 className="about-us__subtitle">{subtitle}</h4>
        <p className="about-us__text">{content}</p>
      </div>
      <div className="about-us__image">
        <img src={abouth} alt="Hakkımızda" />
      </div>
    </section>
  );
};

export default AboutUs;
