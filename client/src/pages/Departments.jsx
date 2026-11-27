import React from "react";
import { Building2, ArrowUpRight } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
export default function Departments() {
  const { departments } = usePortal();
  const { t, localize } = useLanguage();
  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span style={{color:"#007dcb"}} className="eyebrow">{t("ORGANIZATION")}</span>
          <h1>{t("Departments")}</h1>
          <p>
            {t(
              "Department-wise information and resources for the regional O&M teams.",
            )}
          </p>
        </div>
        <span style={{color:"#fff", background:"#007dcb"}} className="large-module-icon">
          <Building2 size={30} />
        </span>
      </div>
      <div className="department-grid">
        {departments.map((d) => (
          <article className="department-card" key={d.id}>
            <span className="department-code">{d.code}</span>
            <h2>{localize(d, "name")}</h2>
            <p>{localize(d, "description")}</p>
            <span className="text-link">
              {t("Department workspace")} <ArrowUpRight size={15} />
            </span>
          </article>
        ))}
      </div>
      {!departments.length && (
        <p className="empty-state">{t("No departments configured.")}</p>
      )}
    </div>
  );
}
