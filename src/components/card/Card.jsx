import { Link } from "react-router-dom";
import "./card.scss";
import defaulImage from "../../assets/r.png";

function Card({ item }) {
  return (
    <div className="shop-card">
      <Link to={`/${item.id}`} className="imageContainer">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item?.title || ""} loading="lazy" />
        ) : (
          <img src={defaulImage} alt="" loading="lazy" />
        )}

        {item?.listingType && item.listingType !== "standard" && (
          <span className={`typeBadge ${item.listingType}`}>
            {item.listingType === "doping" ? "Doping" : "Vitrin"}
          </span>
        )}
      </Link>

      <div className="shop-card__info">
        <h3 className="title">
          <Link to={`/${item?.id}`}>{item?.title}</Link>
        </h3>
        <p className="location">
          {item?.city}/{item?.district}
        </p>
        <p className="price">{item?.price?.toLocaleString("tr-TR")}₺</p>

        <div className="cardFooter">
          <Link to={`/${item?.id}`}>
            <button>İncele</button>
          </Link>

          {typeof item?.approved === "boolean" && (
            <span
              className={`statusBadge ${item.approved ? "approved" : "pending"}`}
            >
              {item.approved ? "Onaylandı" : "Onay Bekleniyor"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
