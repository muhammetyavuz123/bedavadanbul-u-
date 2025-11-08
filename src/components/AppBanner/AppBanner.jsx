import React from "react";
import "./appBanner.scss";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import mobil from "../../assets/mobil.png";

const AppBanner = () => {
  return (
    <div className="app-banner">
      <div className="app-banner__content">
        <div className="app-banner__image">
          <img src={mobil} alt="Mobil Uygulama" width="75px" height="300px" />
        </div>
        <div className="app-banner__text">
          <h1>Kampanyadan Uygulaması Cebinde!</h1>
          <p>
            En iyi fırsatlar artık cebinizde. Hemen indir, alışverişe başla.
          </p>
          <div className="app-banner__buttons">
            <a
              href="https://play.google.com"
              className="btn google"
              target="_blank"
            >
              <FaGooglePlay /> Google Play
            </a>
            <a
              href="https://apps.apple.com"
              className="btn apple"
              target="_blank"
            >
              <FaApple /> App Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBanner;
