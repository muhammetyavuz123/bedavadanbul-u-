import React from "react";
import "./loader.scss"; // CSS dosyasını ayrıca oluştur
import logo from "/logo.png"; // Logonuzun yolunu buraya ekleyin
const Loader = ({ name = "Ahmet" }) => {
  return (
    <div className="logo-loader-container">
      <div className="logo-spinner">
        <img src={logo} alt="logo" className="logo-image" />
      </div>
      {/* <div className="logo-text">{name}</div> */}
    </div>
  );
};

export default Loader;
