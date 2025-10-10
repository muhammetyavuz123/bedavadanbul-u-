import React from "react";
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
        <img className="footer__logo" src="/logo.png" alt="" />

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
              <a href="/about">Hakkımızda</a>
            </li>
            <li>
              <a href="/contact">Kariyer</a>
            </li>
            {/* <li>
              <a href="#">Basın</a>
            </li> */}
          </ul>
        </div>
        <div className="footer__col">
          <h4>Müşteri Hizmetleri</h4>
          <ul>
            <li>
              <a href="/contact">İletişim</a>
            </li>
            {/* <li>
              <a href="#">Sipariş Takibi</a>
            </li>
            <li>
              <a href="#">İade / Değişim</a>
            </li>
            <li>
              <a href="#">SSS</a>
            </li> */}
          </ul>
        </div>
        <div className="footer__col">
          <h4>Bilgi</h4>
          <ul>
            {/* <li>
              <a href="#">Blog</a>
            </li> */}
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
            target="blank"
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
        {/* <div className="footer__payments">
          <img src="/images/visa.svg" alt="Visa" />
          <img src="/images/mastercard.svg" alt="Mastercard" />
          <img src="/images/paypal.svg" alt="PayPal" />
        </div> */}
        <div className="footer__bottom-text">
          <p>
            © 2025 Markanız. Tüm hakları saklıdır. &nbsp; | &nbsp;{" "}
            <a href="#">Gizlilik Politikası</a> &nbsp; | &nbsp;{" "}
            <a href="#">Kullanım Şartları</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
