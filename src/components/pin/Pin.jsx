import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";
import defaultImage from "../../assets/r.png";

function Pin({ item }) {
  return (
    <Marker position={[item.latitude, item.longitude]}>
      <Popup>
        <div className="popupContainer">
          {/* ⚠️ FIX: MapPage artık AYNI ANDA çok sayıda ilanı pin olarak
              gösteriyor; bunlardan biri görselsizse (item.images boş dizi)
              eski kod `item.images[0]` -> undefined src ile kırık bir
              görsel ikonu gösteriyordu. Card.jsx'teki ile aynı desende bir
              varsayılan görsele düşüyoruz. */}
          <img src={item.images?.[0] || defaultImage} alt="" />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.type} </span>
            <b> {item.price}₺</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
