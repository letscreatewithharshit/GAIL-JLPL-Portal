import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  FileText,
  ShieldCheck,
  Activity,
  Users,
  Network,
  ChevronRight,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import RegionCard from "../components/RegionCard";
import ModuleCard from "../components/ModuleCard";
import HeroMedia from "../components/HeroMedia";
import defaultHeroImage from "../images/banner 1.png";
import TodayDate from "../components/TodayDate";
import RegionSwitcher from "../components/RegionSwitcher";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import KeyFigures from "./KeyFigures";
import EventsRouteMap from "../components/EventsRouteMap";
import Documents from "./Documents";
export default function Home() {
  const {
    settings,
    regions,
    modules: allModules,
    highlights: allHighlights,
    events: allEvents,
    meetings: allMeetings,
    documents: allDocuments,
    loading,
    error,
    selectedRegion,
    inRegion,
  } = usePortal();
  const { t, localize, language } = useLanguage();
  // Everything below is limited to the selected region (or shows all regions when none is selected)
  const shownRegions = regions;
  const modules = allModules.filter(
    (m) => !selectedRegion || m.availableRegions?.includes(selectedRegion.id),
  );
  const highlights = allHighlights.filter(inRegion);
  const events = allEvents.filter(inRegion);
  const meetings = allMeetings.filter(inRegion);
  const documents = allDocuments.filter(inRegion);
  const networkCount = shownRegions.reduce(
    (n, r) => n + (r.pipelines?.length || 0),
    0,
  );
  const regionLabel = selectedRegion
    ? localize(selectedRegion, "name")
    : t("ED Regions");
  // Banner: show a video whenever one is available (the selected region's own video
  // first, then the portal-wide one); otherwise show the banner image.
  const bannerVideo = selectedRegion?.video || settings?.heroVideo || "";
  const bannerImage = settings?.heroImage || defaultHeroImage;
  const regionName = selectedRegion
    ? localize(selectedRegion, "name")
    : "Jaipur";
  const heroTitle =
    language === "hi"
      ? `JLPL (O&M) ${regionName} में आपका स्वागत है।`
      : `Welcome to JLPL (O&M) – ${regionName}`;
  const heroSubtitle =
    language === "hi"
      ? settings?.heroSubtitleHi || settings?.heroSubtitle || t("")
      : settings?.heroSubtitle || "";
  return (
    <>
      <section className="hero">
        <HeroMedia video={bannerVideo} image={bannerImage} />
        <div className="container hero-date-wrap">
          <TodayDate />
        </div>

        <div className="container hero-content">
          <div className="hero-copy">
            <span className="hero-kicker">
              {t("GAIL (INDIA) LIMITED · REGIONAL OPERATIONS")}
            </span>
            <h1>{heroTitle}</h1>
            <p>
              {heroSubtitle ||
                t("Pipeline Monitoring and Maintenance Dashboard")}
            </p>
            <div className="hero-actions">
              <Link to="/calendar" className="btn btn-primary">
                {t("Explore events")} <ArrowRight size={17} />
              </Link>
              <Link to="/departments" className="btn btn-glass">
                {t("Explore departments")}
              </Link>
            </div>

            <div className="hero-proof">
              <span>
                <ShieldCheck size={16} /> {t("Safety-led operations")}
              </span>
              <span>
                <Activity size={16} /> {t("Connected information")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-keyfigures">
        <KeyFigures />
      </section>
      <section className="growth-projects-section container">
        <div className="kf-heading">
          <div className="kf-heading-main">
            <div>
              <span className="eyebrow">{t("GAIL · INFRASTRUCTURE")}</span>
              <h1 style={{ color: "white" }}>{t("Growth and Projects")}</h1>

              <p style={{ color: "white" }}>
                {t("From 1.7 MMTPA at commissioning to a planned 6.5 MMTPA, and how JLPL sits within GAIL's LPG network.")}
              </p>
            </div>
          </div>
        </div>

        <div className="growth-analytics-grid">
          <article className="growth-analytics-card capacity-card">
            <header>
              <span className="growth-card-icon">▥</span>
              <strong>{t("Capacity over time, MMTPA")}</strong>
            </header>
            <div
              className="capacity-chart"
              role="img"
              aria-label={t("Capacity growth: 1.7 in 2001, 2.5 in 2003, 3.25 augmented, 6.5 planned expansion")}
            >
              <div className="capacity-y-labels">
                <span>7</span>
                <span>6</span>
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>
              <div className="capacity-plot">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((v) => (
                  <div className="capacity-gridline" key={v}>
                    <span>{v}</span>
                  </div>
                ))}
                <div className="capacity-bars">
                  <div className="capacity-bar-group">
                    <b>1.7</b>
                    <span
                      className="capacity-bar"
                      style={{ height: "24.3%" }}
                    ></span>
                    <small>2001</small>
                  </div>
                  <div className="capacity-bar-group">
                    <b>2.5</b>
                    <span
                      className="capacity-bar"
                      style={{ height: "35.7%" }}
                    ></span>
                    <small>2003</small>
                  </div>
                  <div className="capacity-bar-group">
                    <b>3.25</b>
                    <span
                      className="capacity-bar"
                      style={{ height: "46.4%" }}
                    ></span>
                    <small>{t("Augmented")}</small>
                  </div>
                  <div className="capacity-bar-group">
                    <b>6.5</b>
                    <span
                      className="capacity-bar planned"
                      style={{ height: "92.9%" }}
                    ></span>
                    <small>{t("Expansion (planned)")}</small>
                  </div>
                </div>
              </div>
            </div>
          </article>
          <div>
            <article className="growth-analytics-card exit-card">
              <header>
                <span className="growth-card-icon">⌖</span>
                <strong>{t("Exit points by oil company")}</strong>
              </header>
              <div className="exit-chart-content">
                <div
                  className="exit-donut"
                  role="img"
                  aria-label={t("11 exit points: IOCL 5, BPCL 4, HPCL 2")}
                >
                  <svg viewBox="0 0 180 180" aria-hidden="true">
                    <circle cx="90" cy="90" r="61" className="donut-track" />
                    <circle cx="90" cy="90" r="61" className="donut-iocl" />
                    <circle cx="90" cy="90" r="61" className="donut-bpcl" />
                    <circle cx="90" cy="90" r="61" className="donut-hpcl" />
                  </svg>
                  <div>
                    <strong>11</strong>
                    <small>{t("exit points")}</small>
                  </div>
                </div>
                <div className="exit-legend">
                  <span>
                    <i className="iocl"></i>IOCL <b>5</b>
                  </span>
                  <span>
                    <i className="bpcl"></i>BPCL <b>4</b>
                  </span>
                  <span>
                    <i className="hpcl"></i>HPCL <b>2</b>
                  </span>
                </div>
              </div>
            </article>
            <article className="growth-expansion-card">
              <div className="growth-expansion-status">{t("APPROVED · SEP 2025")}</div>
              <h3>{t("Expansion to 6.5 MMTPA")}</h3>
              <div className="growth-expansion-metrics">
                <div>
                  <strong>≈1,107 km</strong>
                  <span>{t("New LPG pipeline")}</span>
                </div>
                <div>
                  <strong>≈₹5,350 cr</strong>
                  <span>{t("Estimated project cost")}</span>
                </div>
                <div>
                  <strong>{t("5 States")}</strong>
                  <span>GJ, RJ, HR, DL, UP</span>
                </div>
              </div>
              <p>
                {t("Doubles transport capacity to meet growing LPG demand in the north, replacing road tanker movement with safer, lower-emission pipeline transport.")}
              </p>
            </article>
          </div>
        </div>
      </section>
      <EventsRouteMap />
      <section className="section container home-highlights">
        <div className="kf-heading">
          <div className="kf-heading-main">
            <div>
              <span className="eyebrow">{t("LATEST UPDATES")}</span>
              <h1 style={{ color: "white" }}> {t("Highlights")}</h1>

              <p style={{ color: "white" }}>
                {t("Important notices and regional updates.")}
              </p>
            </div>
          </div>
        </div>

        <div className="highlight-list">
          {highlights.slice(0, 5).map((h) => (
            <article className="highlight-item" key={h.id}>
              <div style={{ backgroundColor: "#007dcb", color: "#fff" }} className="date-tile">
                <b>{new Date(h.createdAt).getDate()}</b>
                <span>
                  {new Date(h.createdAt).toLocaleString(
                    language === "hi" ? "hi-IN" : "en-IN",
                    { month: "short" },
                  )}
                </span>
              </div>
              <div>
                <span style={{ color: "#007dcb",}} className="item-category">
                  {localize(h, "category") || t("Update")} ·{" "}
                  {language === "hi"
                    ? h.region?.nameHi || h.region?.name || "सभी क्षेत्र"
                    : h.region?.name || "Shared update"}
                </span>
                <h3>{localize(h, "title")}</h3>
                <p>{localize(h, "body")}</p>
              </div>
              <ArrowUpRight size={17} />
            </article>
          ))}
        </div>
        {!highlights.length && (
          <p className="empty-state">{t("No published highlights yet.")}</p>
        )}
      </section>
      <section className="home-documents">
        <Documents compact />
      </section>
      {error && <p className="container form-message">{t(error)}</p>}
      {settings?.announcement && (
        <div className="container announcement-strip">
          {language === "hi"
            ? settings.announcementHi || settings.announcement
            : settings.announcement}
        </div>
      )}
    </>
  );
}
