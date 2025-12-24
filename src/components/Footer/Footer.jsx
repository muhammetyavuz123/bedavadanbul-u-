import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <img className="footer__logo" src="/logo.png" alt="Bedavadanbul Logo" />

        <p className="footer__tagline">
          Markanızın reklamı burada yer alabilir, Ulaşılabilir olabilirsiniz.
        </p>
      </div>

      <div className="footer__newsletter">
        <h3>Haberler & Kampanyalar</h3>
        <form className="newsletter-form">
          <input type="email" placeholder="E-posta adresiniz" />
          <button type="submit">Abone Ol</button>
        </form>
      </div>

      <div className="footer__links">
        <div className="footer__col">
          <h4>Kurumsal</h4>
          <ul>
            <li>
              <a href="/aboutUs">Hakkımızda</a>
            </li>
            <li>
              <a href="/contact">Kariyer</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Müşteri Hizmetleri</h4>
          <ul>
            <li>
              <a href="/contact">İletişim</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Bilgi</h4>
          <ul>
            <li>
              <a href="/list">Kampanyalar</a>
            </li>
            <li>
              <a href="/">Yeni Kampanyalar</a>
            </li>
            <li>
              <a href="#">Popüler Kampanyalar</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__social">
          <a href="#" className="social-icon">
            <FaFacebookF />
          </a>
          <a
            href="https://www.instagram.com/bedavadanbul/"
            className="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
          <a href="#" className="social-icon">
            <FaTwitter />
          </a>
          <a href="#" className="social-icon">
            <FaLinkedinIn />
          </a>
        </div>

        <div className="footer__bottom-text">
          <p>
            © 2025 Bedavadanbul.com. Tüm hakları saklıdır. &nbsp; | &nbsp;
            <a href="/legal/privacy-policy">Gizlilik Politikası</a> &nbsp; |
            &nbsp;
            <a href="/legal/terms-of-use">Kullanım Şartları</a> &nbsp; | &nbsp;
            <a href="/legal/kvkk">KVKK Aydınlatma Metni</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
