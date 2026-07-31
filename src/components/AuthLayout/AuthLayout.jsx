import React from "react";
import { Link } from "react-router-dom";
import "./authLayout.scss";
import bgImage from "../../assets/authimg.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={bgImage} alt="Tanıtım görseli" />
        <div className="overlay-text">
          <Link to="/" className="brandLink">
            <img src="/logo.png" alt="Bedavadanbul" className="brandLogo" />
          </Link>
          <h2>Bedavadanbul'a Hoş Geldiniz</h2>
          <p>Hızlı, kolay ve güvenli kayıt & giriş sistemi</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="form-box">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
