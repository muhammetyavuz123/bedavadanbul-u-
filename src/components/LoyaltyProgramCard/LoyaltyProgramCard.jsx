import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiGift, FiMapPin, FiCheck } from "react-icons/fi";
import BizAvatar from "../BizAvatar/BizAvatar";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./LoyaltyProgramCard.scss";

export const describeProgram = (p) =>
  p.type === "stamp"
    ? `${p.goal} alışverişte: ${p.rewardText}`
    : `${p.earnAmount} TL alışveriş = ${p.earnPoints} puan`;

// Kampanyalar sayfasında gösterilen sadakat programı kartı. "Katıl" ile müşteri
// kartı açılır; QR'ı mobil uygulamada (Ayarlar > Sadakat Kartlarım) gösterilir.
function LoyaltyProgramCard({ program, compact = false }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [joined, setJoined] = useState(!!program.joined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const biz = program.business || {};
  const isOwn = currentUser?.role === "business";

  const join = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest.post(`/loyalty/programs/${program.id}/join`);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.message || "Katılınamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={compact ? "loyaltyCard compact" : "loyaltyCard"}>
      <Link to={`/isletme/${biz.id}`} className="head">
        <span className="avatar">
          <BizAvatar name={biz.name} logo={biz.logo} />
        </span>
        <span className="who">
          <strong>{biz.name}</strong>
          <small>
            <FiMapPin /> {[biz.district, biz.city].filter(Boolean).join(", ")}
            {biz.category?.name ? ` · ${biz.category.name}` : ""}
          </small>
        </span>
      </Link>

      <div className="rule">
        <FiGift />
        <span>{describeProgram(program)}</span>
      </div>

      {program.type === "points" && program.rewards?.length > 0 && !compact && (
        <ul className="rewards">
          {program.rewards.slice(0, 3).map((r) => (
            <li key={r.id}>
              {r.name} <b>{r.cost} puan</b>
            </li>
          ))}
        </ul>
      )}

      {joined ? (
        <div className="joined">
          <FiCheck /> Katıldınız
          {!compact && (
            <small>QR'ınızı mobil uygulamada Ayarlar &gt; Sadakat Kartlarım bölümünde bulursunuz.</small>
          )}
        </div>
      ) : isOwn ? null : (
        <button type="button" className="joinBtn" onClick={join} disabled={busy}>
          {busy ? "Katılınıyor..." : "Katıl"}
        </button>
      )}
      {error && <p className="err">{error}</p>}
    </article>
  );
}

export default LoyaltyProgramCard;
