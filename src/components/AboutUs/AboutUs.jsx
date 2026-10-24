import React from "react";
import "./aboutUs.scss";
import abouth from "../../assets/abouth.png";

const AboutUs = ({
  title = "Hakkımızda",
  subtitle = "Türkiye’nin Reklamı",
  content = `BedavadanBul.com, yakınınızdaki işletmeleri, indirimleri ve kampanyaları tek yerden keşfedebileceğiniz yerel bir işletme rehberi ve kampanya platformudur. Büyükten küçüğe her türlü işletme, il ve ilçe bazında kendi profilini oluşturur ve kampanyalarını duyurur; kullanıcılar da bulundukları bölgedeki fırsatları kolayca bulur.

Platformda neler var?
• İşletme profilleri: adres, çalışma saatleri, telefon, fotoğraflar ve harita üzerinde konum.
• Güncel kampanyalar: il ve ilçeye göre keşfedin, yakında sona erecek fırsatları kaçırmayın.
• Puan ve yorumlar: Giriş yapan kullanıcıların deneyimleri; işletmeler yorumlara herkese açık yanıt verebilir.
• Doğrudan iletişim: İşletmeye özel soru sorabilir, tek dokunuşla arayabilir ya da yol tarifi alabilirsiniz.
• Favoriler ve bildirimler: Beğendiğiniz işletmeleri kaydedin, duyuruları bildirim kutunuzdan takip edin.
• Web ve mobil: bedavadanbul.com ve iOS ile Android uygulamalarıyla her yerden ulaşın.

İşletmeler için: Başvurunuzu oluşturun, ekibimizin onayından sonra profilinizi tamamlayıp kampanyalarınızı yayınlayın. Profilinizin kaç kez görüntülendiğini, kaç kişinin sizi aradığını ve yol tarifi aldığını işletme panelinizden izleyin.

Amacımız, işletmeler ile müşteriler arasında doğrudan ve hızlı bir köprü kurarak yerel ekonomiyi güçlendirmek, alışverişi keyifli ve uygun fiyatlı hale getirmektir. BedavadanBul.com, sürekli gelişen ve yenilenen bir platform olarak hizmetinizdedir.`,
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
