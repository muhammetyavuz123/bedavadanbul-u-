import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiPhone } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import Loader from "../../components/loader/Loader";
import StarRating from "../../components/StarRating/StarRating";
import BizAvatar from "../../components/BizAvatar/BizAvatar";
import { VerifiedBadge } from "../../components/BizBadges/BizBadges";
import apiRequest from "../../lib/apiRequest";
import { formatPhone, telHref } from "../../lib/formatPhone";
import "./myFavorites.scss";

function MyFavorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiRequest
      .get("/businesses/favorites/mine")
      .then((res) => !cancelled && setItems(res.data?.data || []))
      .catch(() => !cancelled && setError("Favorileriniz yüklenemedi. Lütfen tekrar deneyin."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (id) => {
    const prev = items;
    setItems((list) => list.filter((b) => b.id !== id));
    try {
      await apiRequest.delete(`/businesses/${id}/favorite`);
    } catch {
      setItems(prev);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Favorilerim"
        breadcrumbText="Anasayfa / Favorilerim"
        backgroundImage={BreadcrumbImage}
      />

      <div className="myFavs">
        {loading && <Loader />}
        {error && <p className="favError">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="favEmpty">
            <FiHeart />
            <h2>Henüz favori işletmeniz yok</h2>
            <p>Beğendiğiniz işletmelerin profilindeki kalbe dokunarak buraya ekleyebilirsiniz.</p>
            <Link to="/isletmeler" className="favCta">
              İşletmeleri keşfet
            </Link>
          </div>
        )}

        <div className="favGrid">
          {items.map((b) => (
            <article key={b.id} className="favCard">
              <button
                type="button"
                className="favRemove"
                aria-label="Favorilerden çıkar"
                title="Favorilerden çıkar"
                onClick={() => remove(b.id)}
              >
                <FiHeart />
              </button>
              <Link to={`/isletme/${b.id}`} className="favMain">
                <span className="favLogo">
                  <BizAvatar name={b.name} logo={b.logo} />
                </span>
                <span className="favInfo">
                  <strong>
                    {b.name} {b.isVerified && <VerifiedBadge compact />}
                  </strong>
                  <small className="favCat">{b.category?.name}</small>
                  <span className="favRating">
                    <StarRating value={b.ratingAvg} size={14} />
                    {b.ratingCount > 0 ? `${b.ratingAvg.toFixed(1)} (${b.ratingCount})` : "Yeni"}
                  </span>
                  <small className="favLoc">
                    <FiMapPin /> {b.district}, {b.city}
                  </small>
                </span>
              </Link>
              <div className="favActions">
                <a href={telHref(b.phone)}>
                  <FiPhone /> {formatPhone(b.phone)}
                </a>
                <Link to={`/isletme/${b.id}`}>Profili gör</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyFavorites;
