import React from "react";
import "./authLayout.scss";
import bgImage from "../../assets/authimg.jpg"; // görselini buraya koy

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={bgImage} alt="Tanıtım görseli" />
        {/* <div className="overlay-text">
          <h2>Kliniğinize Hoş Geldiniz</h2>
          <p>Hızlı, kolay ve güvenli kayıt & giriş sistemi</p>
        </div> */}
      </div>
      <div className="auth-right">
        <div className="form-box">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
