import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiGift } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import LoyaltyProgramCard from "../LoyaltyProgramCard/LoyaltyProgramCard";
import "./loyaltyStrip.scss";

// Anasayfadaki "Sadakat Programları" şeridi. Kullanıcının şehrinde program varsa
// onları, yoksa genel olarak en yenileri gösterir. Program yoksa hiçbir şey çizmez.
function LoyaltyStrip() {
  const { currentUser } = useContext(AuthContext);
  const city = currentUser?.city || "";
  const [items, setItems] = useState([]);
  const [local, setLocal] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        if (city) {
          const r = await apiRequest.get("/loyalty/programs", { params: { city, limit: 8 } });
          const list = r.data?.programs || [];
          if (list.length > 0) {
            if (alive) {
              setItems(list);
              setLocal(true);
            }
            return;
          }
        }
        const r = await apiRequest.get("/loyalty/programs", { params: { limit: 8 } });
        if (alive) {
          setItems(r.data?.programs || []);
          setLocal(false);
        }
      } catch {
        if (alive) setItems([]);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [city]);

  if (items.length === 0) return null;

  const more = local && city ? `/list?sadakat=1&city=${encodeURIComponent(city)}` : "/list?sadakat=1";

  return (
    <section className="homeLoyalty">
      <div className="hlHead">
        <div>
          <span className="hlKicker">
            <FiGift /> Sadakat
          </span>
          <h2>{local && city ? `${city}'daki Sadakat Programları` : "Sadakat Programları"}</h2>
          <p>QR'ını okut, biriktir; 5. kahve ya da bir sonraki alışveriş bizden olsun.</p>
        </div>
        <Link to={more} className="hlAll">
          Tümünü Gör →
        </Link>
      </div>
      <div className="hlRow">
        {items.map((p) => (
          <LoyaltyProgramCard key={p.id} program={p} compact />
        ))}
      </div>
    </section>
  );
}

export default LoyaltyStrip;
