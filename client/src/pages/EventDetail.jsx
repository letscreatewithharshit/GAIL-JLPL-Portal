import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Clock3, Images } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import EventPhotoCarousel from "./EventPhotoCarousel";
export default function EventDetail() {
  const { eventId } = useParams();
  const { events, selectedRegionId } = usePortal();
  const { localize, language, t } = useLanguage();
  const event = events.find(
    (e) =>
      String(e.id) === String(eventId) &&
      (e.regionId === selectedRegionId || !e.regionId),
  );
  const photos = useMemo(() => {
    if (!event) return [];
    let list = event.imageUrls || event.images || event.photos || [];
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [list];
      }
    }
    if (!Array.isArray(list)) list = [];
    return [...new Set([event.imageUrl, ...list].filter(Boolean))];
  }, [event]);
  if (!event)
    return (
      <div className="container page-content">
        <p className="empty-state">{t("Event not found in the selected region.")}</p>
        <Link className="btn btn-outline" to="/meetings">
          <ArrowLeft size={16} /> {t("Back to events")}
        </Link>
      </div>
    );
  const date = new Date(event.eventDate);
  return (
    <article className="event-detail-page">
      <div
        className="event-detail-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,49,39,.9),rgba(0,49,39,.28)),url(${photos[0] || ""})`,
        }}
      >
        <div className="container">
          <Link to="/meetings" className="event-back">
            <ArrowLeft size={16} /> {t("Back to events")}
          </Link>
          <span className="eyebrow">
            {t("GAIL INDIA")} · {localize(event.region, "name") || t("REGIONAL EVENT")}
          </span>
          <h1>{localize(event, "title")}</h1>
        </div>
      </div>
      <div className="container event-detail-content">
        <div className="event-facts">
          <span>
            <CalendarDays size={18} />
            {date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
              dateStyle: "full",
            })}
          </span>
          <span>
            <Clock3 size={18} />
            {date.toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>
            <MapPin size={18} />
            {localize(event, "venue") || t("Venue to be announced")}
          </span>
        </div>
        {localize(event, "description") && (
          <section className="event-description">
            <span className="eyebrow">{t("EVENT OVERVIEW")}</span>
            <h2>{t("About this event")}</h2>
            <p>{localize(event, "description")}</p>
          </section>
        )}
        <section className="event-photo-section">
          <div className="section-heading">
            <span className="eyebrow">
              <Images size={15} /> {t("EVENT GALLERY")}
            </span>
            <h2>{t("Event moments")}</h2>
          </div>
          {/* <div className="event-photo-grid">
            {photos.map((src, i) => (
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                key={`${src}-${i}`}
              >
                <img
                  src={src}
                  alt={`${localize(event, "title")} ${i + 1}`}
                  loading="lazy"
                />
              </a>
            ))}
          </div> */}

          <EventPhotoCarousel
            photos={photos}
            title={localize(event, "title")}
          />

          {!photos.length && (
            <p className="empty-state">{t("Event photographs will appear here. / No photographs available yet.")}</p>
          )}
        </section>
      </div>
    </article>
  );
}
