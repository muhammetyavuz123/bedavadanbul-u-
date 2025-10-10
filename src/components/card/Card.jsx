import { Link } from "react-router-dom";
import "./card.scss";
import defaulImage from "../../assets/r.png";

function Card({ item }) {
  return (
    <>
      <div className="shop-card">
        <Link to={`/${item.id}`} className="imageContainer">
          {item?.images[0] ? (
            <img src={item?.images[0]} alt="" />
          ) : (
            <img src={defaulImage} alt="" />
          )}
        </Link>
        <div className="shop-card__info">
          <h3 className="title">
            <Link to={`/${item?.id}`}>{item?.title}</Link>
          </h3>
          <p className="location">
            {item?.city}/{item?.district}
          </p>
          {/* <p className="description">
            <span>{item?.address}</span>
          </p> */}
          <p className="price">{item.price}₺</p>
          <Link to={`/${item?.id}`}>
            {" "}
            <button>İncele</button>
          </Link>
          {item.approved === false ? (
            item.approved ? (
              <span style={{ color: "green", paddingLeft: "5px" }}>
                Onaylanmıştır
              </span>
            ) : (
              <span
                style={{
                  paddingLeft: "5px",
                  backgroundColor: "red",
                  padding: "8px",
                  borderRadius: "5px",
                  color: "white",
                  marginLeft: "5px",
                }}
              >
                Onay Bekleniyor
              </span>
            )
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}

export default Card;
