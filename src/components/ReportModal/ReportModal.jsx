import { useEffect, useState } from "react";
import { FiFlag, FiX, FiCheckCircle } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import "./reportModal.scss";

// Sunucudaki nedenlerle aynı kodlar (api/controllers/report.controller.js)
const REASONS = [
  { key: "spam", label: "Spam / reklam" },
  { key: "abuse", label: "Hakaret veya taciz" },
  { key: "hate", label: "Nefret söylemi" },
  { key: "fake", label: "Sahte veya yanıltıcı" },
  { key: "inappropriate", label: "Uygunsuz içerik" },
  { key: "other", label: "Diğer" },
];

// Küçük "Şikâyet et" bağlantısı (yorum satırlarında kullanılır)
export function ReportLink({ onClick }) {
  return (
    <button type="button" className="reportLink" onClick={onClick} title="Şikâyet et">
      <FiFlag /> Şikâyet et
    </button>
  );
}

// Yorum / kampanya yorumu / işletme şikâyet penceresi
export default function ReportModal({ open, onClose, targetType, targetId }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  // Her açılışta sıfırla
  useEffect(() => {
    if (open) {
      setReason("");
      setDetails("");
      setBusy(false);
      setError("");
      setDoneMsg("");
    }
  }, [open, targetId]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) return setError("Lütfen bir neden seçin.");
    setBusy(true);
    setError("");
    try {
      const res = await apiRequest.post("/reports", {
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setDoneMsg(res.data?.message || "Bildiriminiz alındı. Teşekkürler.");
    } catch (err) {
      setError(err.response?.data?.message || "Şikâyet gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reportOverlay" onClick={onClose} role="presentation">
      <div
        className="reportModal"
        role="dialog"
        aria-modal="true"
        aria-label="Şikâyet et"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="reportClose" onClick={onClose} aria-label="Kapat">
          <FiX />
        </button>

        {doneMsg ? (
          <div className="reportDone">
            <FiCheckCircle />
            <h3>Teşekkürler</h3>
            <p>{doneMsg}</p>
            <button type="button" className="reportPrimary" onClick={onClose}>
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>Şikâyet nedeni</h3>
            <div className="reportReasons">
              {REASONS.map((r) => (
                <label key={r.key} className={reason === r.key ? "on" : ""}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.key}
                    checked={reason === r.key}
                    onChange={() => {
                      setReason(r.key);
                      setError("");
                    }}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="İsterseniz kısaca açıklayın (en fazla 300 karakter)"
            />
            {error && <p className="reportError">{error}</p>}

            <div className="reportActions">
              <button type="submit" className="reportPrimary" disabled={busy}>
                {busy ? "Gönderiliyor..." : "Şikâyeti gönder"}
              </button>
              <button type="button" className="reportGhost" onClick={onClose} disabled={busy}>
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
