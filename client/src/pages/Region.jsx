import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Network,
  FileText,
  CalendarDays,
  Users,
  Image,
} from "lucide-react";
import ModuleCard from "../components/ModuleCard";
import SectionHeading from "../components/SectionHeading";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
export default function Region() {
  const { regionId } = useParams();
  const {
    regions,
    modules,
    highlights,
    meetings,
    directory,
    documents,
    setSelectedRegion,
  } = usePortal();
  const { language, localize, t } = useLanguage();
  const region = regions.find((r) => r.id === regionId);
  useEffect(() => {
    if (region) setSelectedRegion(region.id);
  }, [region?.id]);
  if (!region)
    return (
      <div className="container section">
        <h1>{t("Region not found")}</h1>
        <Link to="/">{t("Back to home")}</Link>
      </div>
    );
  const available = modules.filter((m) =>
    m.availableRegions?.includes(region.id),
  );
  const pipes = region.pipelines || [];
  return (
    <div className="page-shell">
      <div
        className="region-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(17,28,43,.92),rgba(17,28,43,.48)),url(${region.image || ""})`,
        }}
      >
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} /> {t("Back to home")}
          </Link>
          <span className="hero-kicker">{t("ED REGION")}</span>
          <h1>{localize(region, "name")}</h1>
          <p>{localize(region, "description")}</p>
          <div className="region-pipeline-chips">
            {pipes.map((p) => (
              <span key={p.id}>
                <Network size={13} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="container section">
        <div className="region-quick-grid">
          <div>
            <Network />
            <b>{pipes.length}</b>
            <span>{t("Pipeline/network labels")}</span>
          </div>
          <div>
            <FileText />
            <b>{available.length}</b>
            <span>{t("Applicable O&M modules")}</span>
          </div>
          <div>
            <CalendarDays />
            <b>{meetings.filter((m) => m.regionId === region.id).length}</b>
            <span>{t("Published meetings")}</span>
          </div>
          <div>
            <Users />
            <b>{directory.filter((d) => d.regionId === region.id).length}</b>
            <span>{t("Directory records")}</span>
          </div>
        </div>
        <SectionHeading
          eyebrow={t("REGIONAL RESOURCES")}
          title={t("Operations & Maintenance")}
          description={`${t("Access modules applicable to")} ${localize(region, "name")}.`}
        />
        <div className="module-grid">
          {available.map((m) => (
            <ModuleCard key={m.id} item={m} regionId={region.id} />
          ))}
        </div>
        <div className="region-content-grid">
          <section>
            <SectionHeading
              eyebrow={t("REGIONAL UPDATES")}
              title={t("Latest highlights")}
            />
            <div className="simple-list">
              {highlights
                .filter((h) => !h.regionId || h.regionId === region.id)
                .map((h) => (
                  <article key={h.id}>
                    <span className="item-category">
                      {h.category} ·{" "}
                      {new Date(h.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    <h3>{localize(h, "title")}</h3>
                    <p>{localize(h, "body")}</p>
                  </article>
                ))}
            </div>
          </section>
          <section>
            <SectionHeading
              eyebrow={t("COORDINATION")}
              title={t("Upcoming meetings")}
            />
            <div className="simple-list">
              {meetings
                .filter((m) => m.regionId === region.id)
                .map((m) => (
                  <article key={m.id}>
                    <span className="item-category">
                      {m.pipeline?.name} ·{" "}
                      {new Date(m.meetingDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <h3>{localize(m, "title")}</h3>
                    <p>{localize(m, "venue")}</p>
                  </article>
                ))}
              <Link to="/meetings" className="text-link">
                {t("All meetings")} <ArrowLeft size={14} />
              </Link>
            </div>
          </section>
        </div>
        <div className="region-shortcuts">
          <Link to="/key-figures">
            <Network /> {t("Key figures")}
          </Link>
          <Link to="/organogram">
            <Network /> {t("Organogram")}
          </Link>
          <Link to="/meetings">
            <CalendarDays /> {t("Meetings")}
          </Link>
          <Link to="/directory">
            <Users /> {t("Telephone directory")}
          </Link>
          <Link to="/gallery">
            <Image /> {t("Photo gallery")}
          </Link>
          <Link to="/documents">
            <FileText /> {t("Documents")}
          </Link>
        </div>
      </div>
    </div>
  );
}
