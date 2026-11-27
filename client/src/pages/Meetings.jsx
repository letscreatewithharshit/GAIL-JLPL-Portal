import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
export default function Meetings() {
  const [q, setQ] = useState("");
  const { meetings, events, selectedRegionId, inRegion, selectedRegion } =
    usePortal();
  const { t, localize, language } = useLanguage();
  const items = [
    ...meetings.map((m) => ({ ...m, _date: m.meetingDate, _type: "Meeting" })),
    ...events.map((e) => ({ ...e, _date: e.eventDate, _type: "Event" })),
  ]
    .filter(
      (m) =>
        (m.regionId === selectedRegionId || (!m.regionId && inRegion(m))) &&
        `${localize(m, "title")} ${localize(m, "venue") || ""} ${m.pipeline?.name || ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) => new Date(a._date) - new Date(b._date));
  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span style={{color:"#007dcb"}} className="eyebrow">
            {t("REGIONAL COORDINATION")} · {localize(selectedRegion, "name") || "JAIPUR"}
          </span>
          <h1>{t("Meetings & Events")}</h1>
          <p>
            {t(
              "Regional and pipeline-wise meeting information, agendas and minutes.",
            )}
          </p>
        </div>
        <span className="large-module-icon">
          <CalendarDays size={30} />
        </span>
      </div>
      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search meetings and events...")}
          />
        </div>
      </div>
      <div className="meeting-cards">
        {items.map((m) => (
          <article className="meeting-card" key={`${m._type}-${m.id}`}>
            <div className="meeting-date-card">
              <span>
                {new Date(m._date)
                  .toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
                    month: "short",
                  })
                  .toUpperCase()}
              </span>
              <b>{new Date(m._date).getDate()}</b>
              <small>{new Date(m._date).getFullYear()}</small>
            </div>
            <div className="meeting-info">
              <span className="item-category">
                {t(m._type)} · {localize(m.region, "name") || localize(selectedRegion, "name") || ""}{" "}
                {m.pipeline?.name ? `· ${m.pipeline.name}` : ""}
              </span>
              <h3>{localize(m, "title")}</h3>
              <p>
                <Clock size={14} />
                {new Date(m._date).toLocaleString(
                  language === "hi" ? "hi-IN" : "en-IN",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
                <p>
                <MapPin size={14} />
                {localize(m, "venue") || t("Venue to be announced")}
              </p>
              </p>
              
              {m.agenda && <p style={{height: "auto", overflow: "auto",  }}>{localize(m, "agenda")}</p>}
              {m.minutesUrl && (
                <a
                  style={{ color: "blue", fontWeight: "bold" }}
                  href={m.minutesUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Meeting URL 🔗")}
                </a>
              )}
            </div>
            {m._type === "Event" ? (
              <Link className="event-open-link" to={`/events/${m.id}`}>
                {t("View event")} <ArrowUpRight size={16} />
              </Link>
            ) : (
              <span className="status-tag">{t(m._type)}</span>
            )}
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="empty-state">
          {t("No published meetings or events match your search.")}
        </p>
      )}
    </div>
  );
}
