import { useState } from "react";
import "./paymentModal.scss";
import { LISTING_TYPE_LABELS } from "../../lib/pricing";

// Not: Şu an gerçek bir ödeme altyapısı (iyzico/Stripe vb.) entegre değil.
// Bu bileşen sadece ödeme AKIŞINI gösterir; "Öde ve Yayınla" butonuna
// basıldığında kısa bir işleniyor animasyonundan sonra onSuccess() çağrılır
// ve hiçbir gerçek kart bilgisi herhangi bir sunucuya gönderilmez / saklanmaz.
// İleride gerçek bir ödeme sağlayıcısı bağlanacaksa, handlePay içindeki
// setTimeout bloğunun yerine sağlayıcının ödeme çağrısı eklenmelidir.
function PaymentModal({ amount, listingType, duration, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const formatCardNumber = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);

    // 🔒 Simülasyon: gerçek bir çekim yapılmıyor.
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="paymentModalOverlay" onClick={onClose}>
      <div
        className="paymentModal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="closeBtn"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>

        <div className="paymentHeader">
          <span className="lockIcon">🔒</span>
          <h2>Ödemeyi Tamamla</h2>
          <p>İlanınızın yayına girmesi için ödeme adımını tamamlayın.</p>
        </div>

        <div className="orderSummary">
          <div className="row">
            <span>İlan Tipi</span>
            <strong>{LISTING_TYPE_LABELS[listingType] || listingType}</strong>
          </div>
          <div className="row">
            <span>Yayın Süresi</span>
            <strong>{duration} Ay</strong>
          </div>
          <div className="row total">
            <span>Toplam Tutar</span>
            <strong>{Number(amount).toLocaleString("tr-TR")} ₺</strong>
          </div>
        </div>

        <form onSubmit={handlePay} className="cardForm">
          <div className="item">
            <label htmlFor="pm-cardName">Kart Üzerindeki İsim</label>
            <input
              id="pm-cardName"
              type="text"
              placeholder="AD SOYAD"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              autoComplete="cc-name"
              required
            />
          </div>

          <div className="item">
            <label htmlFor="pm-cardNumber">Kart Numarası</label>
            <input
              id="pm-cardNumber"
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              autoComplete="cc-number"
              maxLength={19}
              required
            />
          </div>

          <div className="row2">
            <div className="item">
              <label htmlFor="pm-expiry">Son Kullanma</label>
              <input
                id="pm-expiry"
                type="text"
                placeholder="AA/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                autoComplete="cc-exp"
                maxLength={5}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="pm-cvc">CVC</label>
              <input
                id="pm-cvc"
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                autoComplete="cc-csc"
                maxLength={3}
                required
              />
            </div>
          </div>

          <button type="submit" className="payButton" disabled={processing}>
            {processing
              ? "İşleniyor..."
              : `${Number(amount).toLocaleString("tr-TR")} ₺ Öde ve Yayınla`}
          </button>

          <p className="secureNote">🔒 Bilgileriniz güvenle işlenir</p>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
