import React from "react";
import "./loader.scss"; // CSS dosyasını ayrıca oluştur
import pin from "/pin.png"; // Logonuzun yolunu buraya ekleyin
import logo from "/logo.png"; // Logonuzun yolunu buraya ekleyin
const Loader = ({ name = "Ahmet" }) => {
  return (
    <div className="logo-loader-container">
      <div className="logo-spinner">
        <img src={pin} alt="logo" className="logo-image" />
      </div>
      <img src={logo} alt="logo" className="logo-image" />
    </div>
  );
};

export default Loader;
