import { useState } from "react";
import "./slider.scss";

function Slider({ images }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const prevSlide = () =>
    setActive(active === 0 ? images.length - 1 : active - 1);
  const nextSlide = () =>
    setActive(active === images.length - 1 ? 0 : active + 1);

  return (
    <div className="slider">
      <div className="mainSlide" onClick={() => setFullscreen(true)}>
        <img src={images[active]} alt={`slide-${active}`} />
      </div>

      <div className="thumbs">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
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
            <img src={images[active]} alt={`full-${active}`} />
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
