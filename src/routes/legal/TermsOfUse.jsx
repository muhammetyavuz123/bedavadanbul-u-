import React from "react";
import "./legal.scss";

export default function TermsOfUse() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Kullanım Şartları</h1>

        <p>
          <strong>Son Güncelleme:</strong> Kasım 2025
        </p>
        <p>
          <strong>Platform:</strong> Bedavadanbul.com
        </p>
        <p>
          <strong>Sahibi:</strong> Muhammed Yavuz
        </p>

        <h2>1. Tanımlar</h2>
        <p>
          “Kullanıcı”: Bedavadanbul.com hizmetlerinden yararlanan kişi. “İş
          Yeri”: Platformda reklam veya duyuru paylaşan kullanıcı.
        </p>

        <h2>2. Hizmetin Kapsamı</h2>
        <p>
          Bedavadanbul.com, işletmelerin ücretsiz reklam ve duyuru paylaşmasına
          olanak sağlayan çevrim içi bir platformdur.
        </p>

        <h2>3. Üyelik ve Kullanıcı Yükümlülükleri</h2>
        <ul>
          <li>Kayıt bilgilerinin doğru ve güncel olması zorunludur.</li>
          <li>Kullanıcı hesabı üçüncü kişilerle paylaşılamaz.</li>
          <li>
            Yasalara aykırı, yanıltıcı ve zararlı içerik paylaşmak yasaktır.
          </li>
        </ul>

        <h2>4. Reklam İçerikleri</h2>
        <p>
          Paylaşılan reklam ve duyurulardan ilgili iş yeri sorumludur.
          Bedavadanbul.com içerik doğruluğunu garanti etmez.
        </p>

        <h2>5. Elektronik İleti Onayı</h2>
        <p>
          Kullanıcı, açık rıza vermesi hâlinde kampanya ve tanıtım mesajları
          alabilir. Bu onay istenildiği anda geri çekilebilir.
        </p>

        <h2>6. Fikri Mülkiyet Hakları</h2>
        <p>
          Platformun tasarımı, içeriği ve kodları Muhammed Yavuz’a aittir.
          İzinsiz kopyalanamaz veya dağıtılamaz.
        </p>

        <h2>7. Sorumluluk Reddi</h2>
        <p>
          Bedavadanbul.com, kullanıcıların faaliyetlerinden doğacak zararlardan
          sorumlu değildir. Teknik arıza veya üçüncü taraf kaynaklı kesintiler
          yaşanabilir.
        </p>

        <h2>8. Fesih ve Hesap Silme</h2>
        <p>
          Kullanıcı dilediği zaman hesabını silebilir. Kurallara aykırı
          davranışlarda platform hesabı askıya alabilir.
        </p>

        <h2>9. Uygulanacak Hukuk ve Yetki</h2>
        <p>
          İşbu şartlar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklarda
          İstanbul Mahkemeleri yetkilidir.
        </p>
      </div>
    </div>
  );
}
