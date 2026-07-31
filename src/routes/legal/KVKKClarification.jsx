import "./legal.scss";
import { FiMail, FiUser } from "react-icons/fi";

export default function KVKKClarification() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Kişisel Verilerin Korunması Aydınlatma Metni (KVKK)</h1>

        <div className="section">
          <p>
            <strong>Veri Sorumlusu:</strong> Muhammed Yavuz
          </p>
          <p>
            <strong>İletişim:</strong>{" "}
            <a href="mailto:bedavadanbul@gmail.com">
              bedavadanbul@gmail.com
            </a>
          </p>
        </div>

        <h2>1. Veri İşleme Amacı</h2>
        <p>
          Bedavadanbul.com, üyelik, reklam paylaşımı ve bildirim gönderimi
          süreçlerinde kişisel verilerinizi 6698 sayılı KVKK kapsamında
          işlemektedir:
        </p>
        <ul>
          <li>Üyelik ve kimlik doğrulama işlemleri</li>
          <li>Hizmetlerin sunulması ve kullanıcı iletişimi</li>
          <li>Kampanya ve bilgilendirme gönderimleri</li>
          <li>Yasal yükümlülükler</li>
        </ul>

        <h2>2. Toplanan Veriler</h2>
        <ul>
          <li>Ad, soyad</li>
          <li>Firma adı</li>
          <li>E-posta adresi</li>
          <li>Cep telefonu numarası</li>
          <li>Şehir, ilçe, adres</li>
          <li>Kategori bilgisi</li>
        </ul>

        <h2>3. Veri Aktarımı</h2>
        <p>
          Veriler yalnızca hizmetlerin sağlanması için zorunlu durumlarda
          (SMS/e-posta servisleri, barındırma hizmetleri vb.) yurt içindeki iş
          ortaklarıyla paylaşılır.
        </p>

        <h2>4. Haklarınız</h2>
        <p>KVKK’nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse bilgi talep etme</li>
          <li>Eksik/yanlış verilerin düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini talep etme</li>
          <li>İşleme faaliyetlerine itiraz etme</li>
        </ul>

        <p>
          Taleplerinizi{" "}
          <a href="mailto:bedavadanbul@gmail.com">
            <strong>bedavadanbul@gmail.com</strong>
          </a>{" "}
          adresine iletebilirsiniz.
        </p>

        <h2>5. Veri Saklama Süresi</h2>
        <p>
          Verileriniz işleme amaçları sona erdiğinde veya yasal yükümlülükler
          ortadan kalktığında imha edilir.
        </p>

        <h2>6. İletişim</h2>
        <p className="contactLine">
          <FiMail /> E-posta:{" "}
          <a href="mailto:bedavadanbul@gmail.com">bedavadanbul@gmail.com</a>
          <br />
          <FiUser /> Veri Sorumlusu: Muhammed Yavuz
        </p>
      </div>
    </div>
  );
}
