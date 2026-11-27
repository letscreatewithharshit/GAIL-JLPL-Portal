import React, { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  ClipboardCheck,
  Activity,
  FileCheck,
  ArrowUpRight,
  FolderOpen,
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import { DOC_CATEGORIES } from "../constants";
import { useSearchParams } from "react-router-dom";
import iqmsCover from "../images/iqms-cover.svg";
import auditsCover from "../images/audits-cover.svg";
import integrityCover from "../images/pipeline-integrity-cover.svg";
import statutoryCover from "../images/statutory-cover.svg";
const icons = { ShieldCheck, ClipboardCheck, Activity, FileCheck };
const covers = {
  IQMS: iqmsCover,
  Audits: auditsCover,
  "Pipeline Integrity": integrityCover,
  "Statutory Documents": statutoryCover,
};
export default function Documents({ compact = false }) {
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(
    params.get("category") || DOC_CATEGORIES[0].value,
  );
  const { documents, selectedRegionId, selectedRegion } = usePortal();
  const { localize, t, language } = useLanguage();
  const inScope = documents.filter(
    (d) => !d.regionId || d.regionId === selectedRegionId,
  );
  const countFor = (value) =>
    inScope.filter((d) => d.category === value).length;
  const rows = inScope.filter(
    (d) =>
      d.category === category &&
      `${localize(d, "title")} ${d.description || ""} ${d.pipeline?.name || ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const active = DOC_CATEGORIES.find((c) => c.value === category);
  const choose = (value) => {
    setCategory(value);
    setParams(value ? { category: value } : {});
  };
  return (
    <div
      className={`container ${compact ? "doc-home-section" : "page-content doc-page"}`}
    >
      <div>
        <div className="kf-heading">
          <div className="kf-heading-main">
            <div>
              <span className="eyebrow">{t("KNOWLEDGE & RECORDS")}</span>

              <h1 style={{ color: "white" }}>{t("Documents")}</h1>

              <p style={{ color: "white" }}>
                {t(
                  "Access operational systems, audit records and statutory resources.",
                )}
              </p>
            </div>

            <span className="large-module-icon">
              <FolderOpen size={30} />
            </span>
          </div>
        </div>
      </div>

      <div className="doc-category-grid">
        {DOC_CATEGORIES.map((c) => {
          const Icon = icons[c.icon] || FileText;
          return (
            <button
              type="button"
              key={c.value}
              className={`doc-category-card ${category === c.value ? "selected" : ""}`}
              onClick={() => choose(c.value)}
            >
              <img src={covers[c.value]} alt="" />
              <span className="doc-card-shade" />
              <span className="doc-card-content">
                <span className="doc-card-icon">
                  <Icon size={20} />
                </span>
                <b>{language === "hi" ? c.hi : c.value}</b>
                <small>{c.description}</small>
                <em>
                  {countFor(c.value)} {t("documents")}{" "}
                  <ArrowUpRight size={14} />
                </em>
              </span>
            </button>
          );
        })}
      </div>
      <div className="doc-library-heading">
        <div>
          <span style={{ color: "#007dcb" }} className="eyebrow">
            {t("DOCUMENT LIBRARY")}
          </span>
          <h2>{language === "hi" ? active?.hi || category : category}</h2>
          <p>{t("Browse published files for the selected collection.")}</p>
        </div>
        <div className="filter-bar doc-filter">
          <div className="search-field">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search documents...")}
            />
          </div>
          <span className="directory-region-label">
            {localize(selectedRegion, "name") || "Jaipur"}
          </span>
        </div>
      </div>
      <div className="document-table">
        {rows.map((d) => (
          <div className="table-row doc-library-row" key={d.id}>
            <div className="doc-name">
              <FileText size={20} />
              <div>
                <b>{localize(d, "title")}</b>
                <small>
                  {language === "hi" ? active?.hi || d.category : d.category} ·{" "}
                  {language === "hi"
                    ? d.region?.nameHi || d.region?.name
                    : d.region?.name}
                </small>
              </div>
            </div>
            <span>{d.pipeline?.name || "—"}</span>
            <span>{new Date(d.createdAt).toLocaleDateString("en-IN")}</span>
            <span>{d.mimeType?.split("/").pop()?.toUpperCase() || "FILE"}</span>
            {d.storageKey ? (
              <a href={d.storageKey} target="_blank" rel="noreferrer">
                <Download size={16} /> {t("Open")}
              </a>
            ) : (
              <span className="muted-small">{t("No file attached")}</span>
            )}
          </div>
        ))}
      </div>
      {!rows.length && (
        <p className="empty-state">{t("No published documents found.")}</p>
      )}
    </div>
  );
}
