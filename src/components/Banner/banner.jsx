import React from "react";
import "./banner.scss";
import video from "../../assets/banner.mp4";

const Banner = ({ title, subtitle, ctaText, ctaLink, align }) => {
  return (
    <section
      className={`promo-banner promo-align-${align}`}
      role="region"
      aria-label="Reklam Banner"
    >
      <video className="promo-video" autoPlay muted loop playsInline>
        <source src={video} type="video/mp4" />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>

      <div className="promo-overlay" />
      <div className="promo-content">
        <div className="promo-text">
          <h2 className="promo-title">{title}</h2>
          <p className="promo-sub">{subtitle}</p>
          <a className="promo-cta" href={ctaLink} aria-label={ctaText}>
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Banner;
