
import React from "react";
import {
  Ruler,
  Gauge,
  Truck,
  Waypoints,
  Flame,
  ShieldCheck,
  HardHat,
  Users,
  Map,
  MapPin,
  Zap,
  Droplet,
  Activity,
  Factory,
} from "lucide-react";

import RegionSwitcher from "../components/RegionSwitcher";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import { KEY_FIGURE_SLOTS } from "../constants";

const icons = {
  Ruler,
  Gauge,
  Truck,
  Waypoints,
  Flame,
  ShieldCheck,
  HardHat,
  Users,
  Map,
  MapPin,
  Zap,
  Droplet,
  Activity,
  Factory,
};

const colors = [
  "blue",
  "cyan",
  "amber",
  "red",
  "purple",
  "green",
  "gold",
  "indigo",
];

export default function KeyFigures() {
  const {
    regions,
    keyFigures,
    selectedRegion,
    loading,
  } = usePortal();

  const { t, localize, language } = useLanguage();

  // Preserve existing region-based API behavior.
  const region = selectedRegion || regions[0];

  const boxes = KEY_FIGURE_SLOTS.map((def, index) => {
    const record = region
      ? keyFigures.find((k) => k.regionId === region.id && k.slot === def.slot)
      : keyFigures.find((k) => k.slot === def.slot);

    return {
      ...def,
      record,
      color: colors[index % colors.length],
    };
  });

  return (
    <section className="container page-content key-figures-page">

      {/* Section introduction */}
      <div className="kf-heading">
        <div  className="kf-heading-main">
          <div >
            <span className="eyebrow">
              {region
                ? localize(region, "name").toUpperCase()
                : t("OPERATIONS")}
            </span>

            <h1 style={{color:"white"}}>{t("Key Figures")}</h1>

            <p style={{color:"white"}}>
              {region
                ? `${localize(region, "name")} — ${t(
                    "key operating figures"
                  )}`
                : t("Key operating figures by region.")}
            </p>
          </div>

          <div className="kf-live-indicator">
            <span />
            {t("Operational Overview")}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="kf-section-heading">
        <div>
          <span>{t("PERFORMANCE SNAPSHOT")}</span>
        </div>

        <div className="kf-count">
          {String(boxes.length).padStart(2, "0")}
          <small> {t("INDICATORS")}</small>
        </div>
      </div>

      <div className="kf-grid">
        {boxes.map(
          ({ slot, label, hi, icon, record, color }) => {
            const Icon = icons[icon] || Activity;

            const title = record
              ? localize(record, "label")
              : language === "hi"
                ? hi
                : label;

            return (
              <article
                className={`kf-card kf-${color} ${
                  record ? "" : "kf-empty"
                }`}
                key={slot}
              >
                <div className="kf-card-top">
                  <div className="kf-icon">
                    <Icon size={23} strokeWidth={1.9} />
                  </div>

                  <span className="kf-slot">
                    {String(slot).padStart(2, "0")}
                  </span>
                </div>

                <div className="kf-card-content">
                  <div className="kf-value-row">
                    <strong className="kf-value">
                      {record ? record.value : "—"}
                    </strong>

                    {record?.unit && (
                      <span className="kf-unit">
                        {record.unit}
                      </span>
                    )}
                  </div>

                  <h3 className="kf-label">{title}</h3>

                  <div className="kf-card-footer">
                    <span className="kf-footer-dot" />
                    <span>
                      {record
                        ? t("Regional Infrastructure")
                        : t("Data not available")}
                    </span>
                  </div>
                </div>

                <div className="kf-progress">
                  <span />
                </div>

                <div className="kf-card-glow" />
              </article>
            );
          }
        )}
      </div>

      {/* Loading / Empty state */}
      {loading && (
        <div className="kf-loading">
          {t("Loading key figures...")}
        </div>
      )}

      {!loading && !regions.length && (
        <div className="kf-no-data">
          <Factory size={28} />
          <strong>{t("No regions configured yet.")}</strong>
          <span>
            {t("Run the database seed command.")}
          </span>
        </div>
      )}
    </section>
  );
}
