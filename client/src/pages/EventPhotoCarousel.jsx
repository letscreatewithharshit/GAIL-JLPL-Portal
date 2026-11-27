import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function EventPhotoCarousel({ photos = [], title = "Event" }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const { t } = useLanguage();
  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  const total = photos.length;

  const getPhotoIndex = (offset) => {
    return (currentPhoto + offset + total) % total;
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + total) % total);
  };

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % total);
  };

  return (
    <div className="event-photo-carousel">
      <div className="event-photo-viewport">
        {[-1, 0, 1].map((offset) => {
          const photoIndex = getPhotoIndex(offset);

          return (
            <div
              key={`${photoIndex}-${offset}`}
              className={`event-photo-card ${offset === 0 ? "active" : "side"}`}
              style={{
                transform: `translateX(calc(-50% + ${offset * 90}%))`,
                zIndex: offset === 0 ? 3 : 2,
              }}
            >
              <a href={photos[photoIndex]} target="_blank" rel="noreferrer">
                <img
                  src={photos[photoIndex]}
                  alt={`${title} ${photoIndex + 1}`}
                  loading="lazy"
                />
              </a>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="carousel-btn carousel-btn-left"
            onClick={prevPhoto}
            aria-label={t("Previous photo")}
          >
            &#10094;
          </button>

          <button
            type="button"
            className="carousel-btn carousel-btn-right"
            onClick={nextPhoto}
            aria-label={t("Next photo")}
          >
            &#10095;
          </button>

          <div className="carousel-counter">
            {currentPhoto + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
}
