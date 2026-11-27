import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ArrowUpRight,
  Map as MapIcon,
} from "lucide-react";

import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import routeMap from "../images/jlpl-route-map.webp";

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function EventsRouteMap() {
  const { events: allEvents, meetings: allMeetings, inRegion } = usePortal();

  const { language, localize, t } = useLanguage();

  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [selected, setSelected] = useState(() => new Date());

  // Combine all events and meetings for the currently selected region.
  const items = useMemo(
    () =>
      [
        ...allEvents.filter(inRegion).map((e) => ({
          ...e,
          date: new Date(e.eventDate),
          kind: "event",
        })),

        ...allMeetings.filter(inRegion).map((m) => ({
          ...m,
          date: new Date(m.meetingDate),
          kind: "meeting",
        })),
      ]
        .filter((x) => !Number.isNaN(x.date.getTime()))
        .sort((a, b) => a.date - b.date),

    [allEvents, allMeetings, inRegion],
  );

  // Calendar calculations
  const first = month.getDay();

  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const cells = [
    ...Array(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  while (cells.length % 7) {
    cells.push(null);
  }

  // All events and meetings remain visible regardless of selected date.
  const allVisibleItems = items;

  const dateLabel = selected.toLocaleDateString(
    language === "hi" ? "hi-IN" : "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const move = (n) => {
    const next = new Date(month.getFullYear(), month.getMonth() + n, 1);

    setMonth(next);
    setSelected(next);
  };

  return (
    <section className="container er-section">
      {/* Section heading */}
      <div className="kf-heading">
        <div className="kf-heading-main">
          <div>
            <span className="eyebrow">{t("GAIL EVENTS AND MAP")}</span>

            <h1 style={{ color: "white" }}>{t("Events and the Route Map")}</h1>

            <p style={{ color: "white" }}>
              {t("What is happening across the line this month, and where.")}
            </p>
          </div>

          <div className="kf-live-indicator">
            <Link
              style={{ color: "white" }}
              to="/calendar"
              className="text-link"
            >
              {t("Open Calendar")} <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="er-layout">
        {/* Events and calendar panel */}
        <section className="er-events">
          <div className="er-panel-title">
            <span>
              <CalendarDays size={19} />
              {t("Events and notifications")}
            </span>
          </div>

          {/* Calendar month navigation */}
          <div className="er-month">
            <button onClick={() => move(-1)} aria-label={t("Previous month")}>
              <ChevronLeft size={18} />
            </button>

            <strong>
              {month.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
                month: "long",
                year: "numeric",
              })}
            </strong>

            <button onClick={() => move(1)} aria-label={t("Next month")}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="er-week">
            {(language === "hi"
              ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"]
              : ["S", "M", "T", "W", "T", "F", "S"]
            ).map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Calendar dates */}
          <div className="er-days">
            {cells.map((day, i) => {
              const date = day
                ? new Date(month.getFullYear(), month.getMonth(), day)
                : null;

              const has = date && items.some((x) => sameDay(x.date, date));

              return (
                <button
                  key={i}
                  disabled={!day}
                  className={`${
                    date && sameDay(date, selected) ? "active" : ""
                  } ${has ? "has-event" : ""}`}
                  onClick={() => date && setSelected(date)}
                >
                  {day || ""}
                  {has && <i />}
                </button>
              );
            })}
          </div>

          {/* Selected date label */}
          <div className="er-agenda-head">
            <span style={{ color: "black" }}>{t("Selected date")}</span>

            <small style={{ color: "black" }}>{dateLabel}</small>
          </div>

          {/* All events and meetings - scrollable list */}
          <div
            className="er-event-list custom-scroll-1"
            style={{
              maxHeight: "650px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {allVisibleItems.map((item) => (
              <Link
                to={item.kind === "event" ? `/events/${item.id}` : "/meetings"}
                className={`er-event ${item.kind}`}
                key={`${item.kind}-${item.id}`}
              >
                {/* Event date */}
                <div className={`er-date ${item.kind}`}>
                  <b>{item.date.getDate()}</b>

                  <span style={{ color: "white" }}>
                    {item.date.toLocaleDateString("en-IN", {
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Event information */}
                <div className="er-event-copy">
                  <p
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t("Title:")}
                    </span>{" "}
                    {localize(item, "title")}
                  </p>

                  {/* Scrollable description */}
                  <p
                    style={{
                      minHeight: "5rem",
                      maxHeight: "20rem",
                      width: "100%",
                      overflowY: "auto",
                      overflowX: "hidden",
                      color: "black",
                      border: "2px solid #ccc",
                      borderRadius: "5px",
                      padding: "0.5rem",
                      boxSizing: "border-box",
                      fontSize: "0.8rem",
                    }}
                  >
                    {t("Description:")}{" "}
                    {localize(item, "description") ||
                      localize(item, "venue") ||
                      (item.kind === "meeting"
                        ? "Regional coordination meeting"
                        : "Regional event")}
                  </p>

                  {/* Time and venue */}
                  <small>
                    <Clock3 size={12} />

                    {item.date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                    <MapPin size={12} />

                    {localize(item, "venue") ||
                      localize(item.region, "name") ||
                      "All stations"}
                  </small>
                </div>
              </Link>
            ))}

            {!allVisibleItems.length && (
              <p className="er-empty">
                {t(
                  "No published events yet. Events added in Admin will appear here.",
                )}
              </p>
            )}
          </div>

          {/* View all events */}
          <Link to="/calendar" className="er-view-all">
            {t("View all events")} <ArrowUpRight size={14} />
          </Link>
        </section>

        {/* Route map panel */}
        <section className="er-map-panel">
          <div className="er-panel-title">
            <span>
              <MapIcon size={19} />
              {t("JLPL Route Map")}
            </span>
          </div>

          <a
            className="er-map-image"
            href={routeMap}
            target="_blank"
            rel="noreferrer"
            aria-label={t("Open full size Jamnagar Loni pipeline map")}
          >
            <img
              src={routeMap}
              alt={t(
                "Jamnagar–Loni LPG Pipeline route map from the supplied pipeline drawing",
              )}
            />

            <span
              style={{ fontSize: "0.9rem", color: "rgb(0, 125, 203)" }}
              className="er-map-zoom"
            >
              ⤢ {t("View full map")}
            </span>
          </a>

          <div className="er-map-foot">
            <span>{t("JAMNAGAR — LONI LPG PIPELINE")}</span>

            <small>
              {t(
                "Source: supplied pipeline route drawing · positions and annotations as shown in PDF",
              )}
            </small>
          </div>
        </section>
      </div>
    </section>
  );
}
