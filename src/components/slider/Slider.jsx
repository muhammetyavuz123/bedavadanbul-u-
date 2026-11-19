import { useEffect, useState } from "react";
import "./slider.scss";
import BrandPlaceholder from "../BrandPlaceholder/BrandPlaceholder";
import SafeImage from "../SafeImage/SafeImage";
import { realImages } from "../../lib/images";

function Slider({ images = [] }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Sadece geçerli fotoğraflar; hiç yoksa kodla çizilmiş marka görünür.
  const photos = realImages(images);
  const hasPhotos = photos.length > 0;

  useEffect(() => {
    if (active > photos.length - 1) setActive(0);
  }, [photos.length, active]);

  const prevSlide = () => setActive(active === 0 ? photos.length - 1 : active - 1);
  const nextSlide = () => setActive(active === photos.length - 1 ? 0 : active + 1);

  return (
    <div className="slider">
      <div
        className={`mainSlide ${hasPhotos ? "" : "empty"}`.trim()}
        onClick={() => hasPhotos && setFullscreen(true)}
      >
        {hasPhotos ? (
          <SafeImage src={photos[active]} alt={`slide-${active}`} loading="eager" />
        ) : (
          <BrandPlaceholder />
        )}
      </div>

      {photos.length > 1 && (
        <div className="thumbs">
          {photos.map((img, idx) => (
            <SafeImage
              key={idx}
              src={img}
              className={active === idx ? "active" : ""}
              onClick={() => setActive(idx)}
              alt={`thumb-${idx}`}
            />
          ))}
        </div>
      )}

      {fullscreen && hasPhotos && (
        <div className="overlay">
          <div className="arrow left" onClick={prevSlide}>
            <img src="/arrow.png" alt="prev" />
          </div>
          <div className="fullImage">
            <img src={photos[active]} alt={`full-${active}`} />
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
