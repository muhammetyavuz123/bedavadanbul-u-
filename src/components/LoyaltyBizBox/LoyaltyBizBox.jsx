import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiGift, FiSmartphone } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { describeProgram } from "../LoyaltyProgramCard/LoyaltyProgramCard";
import "./loyaltyBizBox.scss";

// İşletme sayfasındaki sadakat kutusu: "5 alışverişte 1 kahve hediye" + Katıl.
// İşletmenin açık bir programı yoksa hiçbir şey çizmez.
function LoyaltyBizBox({ businessId, isOwner = false }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setProgram(null);
    apiRequest
      .get(`/loyalty/business/${businessId}`)
      .then((r) => {
        if (!alive) return;
        setProgram(r.data?.program || null);
        setJoined(!!r.data?.card);
      })
      .catch(() => alive && setProgram(null));
    return () => {
      alive = false;
    };
  }, [businessId, currentUser?.id]);

  if (!program) return null;

  const join = async () => {
    if (!currentUser) return navigate("/login");
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
    <section className="bizCard loyaltyBox" id="loyalty">
      <div className="lbTop">
        <span className="lbIcon">
          <FiGift />
        </span>
        <div className="lbText">
          <small>Sadakat kartı</small>
          <strong>{describeProgram(program)}</strong>
        </div>
      </div>

      {program.type === "points" && program.rewards?.length > 0 && (
        <ul className="lbRewards">
          {program.rewards.slice(0, 4).map((r) => (
            <li key={r.id}>
              {r.name} <b>{r.cost} puan</b>
            </li>
          ))}
        </ul>
      )}

      {isOwner ? (
        <p className="lbNote">Sadakat programınız yayında; müşteriler bu kutuda "Katıl" düğmesini görür.</p>
      ) : joined ? (
        <div className="lbJoined">
          <span>
            <FiCheck /> Katıldınız
          </span>
          <small>
            <FiSmartphone /> QR'ınız mobil uygulamada: Ayarlar &gt; Sadakat Kartlarım ve QR
          </small>
        </div>
      ) : (
        <>
          <button type="button" className="lbJoin" onClick={join} disabled={busy}>
            {busy ? "Katılınıyor..." : currentUser ? "Katıl" : "Giriş yapıp katıl"}
          </button>
          <p className="lbNote">Alışveriş yaparken uygulamadaki QR'ınızı okutun, hediyeniz birikir.</p>
        </>
      )}
      {error && <p className="lbErr">{error}</p>}
    </section>
  );
}

export default LoyaltyBizBox;
