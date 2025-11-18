import { useState } from "react";
import "./slider.scss";
import defaulImage from "../../assets/r.png";

function Slider({ images = [] }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Eğer images boşsa fallback olarak default image kullan
  const sliderImages = images.length > 0 ? images : [defaulImage];

  const getImage = (img) => (img ? img : defaulImage);

  const prevSlide = () =>
    setActive(active === 0 ? sliderImages.length - 1 : active - 1);
  const nextSlide = () =>
    setActive(active === sliderImages.length - 1 ? 0 : active + 1);

  return (
    <div className="slider">
      <div className="mainSlide" onClick={() => setFullscreen(true)}>
        <img src={getImage(sliderImages[active])} alt={`slide-${active}`} />
      </div>

      <div className="thumbs">
        {sliderImages.map((img, idx) => (
          <img
            key={idx}
            src={getImage(img)}
            className={active === idx ? "active" : ""}
            onClick={() => setActive(idx)}
            alt={`thumb-${idx}`}
          />
        ))}
      </div>

      {fullscreen && (
        <div className="overlay">
          <div className="arrow left" onClick={prevSlide}>
            <img src="/arrow.png" alt="prev" />
          </div>
          <div className="fullImage">
            <img src={getImage(sliderImages[active])} alt={`full-${active}`} />
          </div>
          <div className="arrow right" onClick={nextSlide}>
            <img src="/arrow.png" alt="next" className="right" />
          </div>
          <div className="close" onClick={() => setFullscreen(false)}>
            ×
          </div>
        </div>
      )}
    </div>
  );
}

export default Slider;
