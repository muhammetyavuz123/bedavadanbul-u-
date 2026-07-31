import React from "react";
import "./legal.scss";

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Gizlilik Politikası</h1>

        <p>
          <strong>Son Güncelleme:</strong> Kasım 2025
        </p>
        <p>
          <strong>Veri Sorumlusu:</strong> BedavadanBul.com
        </p>
        <p>
          <strong>İletişim:</strong>{" "}
          <a href="mailto:bedavadanbul@gmail.com">bedavadanbul@gmail.com</a>
        </p>

        <h2>1. Genel Bilgilendirme</h2>
        <p>
          Bu Gizlilik Politikası, Bedavadanbul.com (“Platform”) üzerinden
          sunulan hizmetlerin kullanımı sırasında toplanan kişisel verilerin
          işlenme, saklanma ve korunma süreçlerini açıklamaktadır. Platformun
          sahibi ve veri sorumlusu BedavadanBul.com’dur.
        </p>

        <h2>2. Toplanan Kişisel Veriler</h2>
        <p>
          Platform üyeliği sırasında aşağıdaki kişisel veriler işlenmektedir:
        </p>
        <ul>
          <li>Ad ve soyad</li>
          <li>Firma adı</li>
          <li>E-posta adresi</li>
          <li>Cep telefonu numarası</li>
          <li>Kategori seçimi</li>
          <li>Şehir, ilçe, açık adres</li>
          <li>IP adresi, tarayıcı bilgileri, işlem kayıtları</li>
        </ul>

        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <p>Toplanan veriler şu amaçlarla işlenir:</p>
        <ul>
          <li>Kullanıcı hesabı oluşturma ve yönetme</li>
          <li>İşletme kayıt ve ilan süreçlerinin yürütülmesi</li>
          <li>Kampanya ve duyuru gönderimi</li>
          <li>İstatistiksel analiz ve hizmet geliştirme</li>
          <li>Yasal yükümlülükler</li>
        </ul>

        <h2>4. Verilerin İşlenme ve Saklanma Süresi</h2>
        <p>
          Kişisel veriler, işlendikleri amaç sona erene kadar veya yasal süreler
          boyunca saklanır. Hesap silindiğinde veriler imha edilir.
        </p>

        <h2>5. Verilerin Aktarımı</h2>
        <p>
          Veriler, yalnızca hizmet sunumu için gerekli teknik servis
          sağlayıcılarıyla (hosting, SMS/e-posta servisleri vb.) paylaşılır.
        </p>

        <h2>6. Çerezler (Cookies)</h2>
        <p>
          Kullanıcı deneyimini geliştirmek adına çerezler kullanılmaktadır.
          Kullanıcı isterse tarayıcı ayarlarından çerezleri devre dışı
          bırakabilir.
        </p>

        <h2>7. Kullanıcı Hakları</h2>
        <p>KVKK kapsamında kullanıcılar:</p>
        <ul>
          <li>Verilerine erişme</li>
          <li>Düzeltme veya silme talep etme</li>
          <li>İşlenmesini kısıtlama veya itiraz etme</li>
          <li>Veri taşınabilirliği talep etme</li>
        </ul>
        <p>
          Talepler{" "}
          <a href="mailto:bedavadanbul@gmail.com">
            <strong>bedavadanbul@gmail.com</strong>
          </a>{" "}
          adresine iletilebilir.
        </p>

        <h2>8. Güvenlik</h2>
        <p>
          Veriler SSL şifreleme ve güvenli sunucu altyapısıyla korunur. Muhammed
          Yavuz, yetkisiz erişime karşı tüm teknik ve idari tedbirleri
          almaktadır.
        </p>

        <h2>9. Değişiklikler</h2>
        <p>
          Gizlilik politikası gerektiğinde güncellenebilir. Güncellemeler
          yayınlandığı anda yürürlüğe girer.
        </p>
      </div>
    </div>
  );
}
