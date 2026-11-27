import React, { useMemo, useState } from "react";
import {
  Network,
  ChevronDown,
  ChevronRight,
  UserRound,
  FileText,
  Download,
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";

function Node({ node, childrenByParent }) {
  const [open, setOpen] = useState(true);
  const { localize, t } = useLanguage();
  const children = childrenByParent.get(node.id) || [];
  return (
    <div className="tree-node">
      <button className="tree-node-card" onClick={() => setOpen(!open)}>
        {children.length ? (
          open ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )
        ) : (
          <UserRound size={16} />
        )}
        <span>
          <b>{localize(node, "name")}</b>
          <small>
            {localize(node, "designation") || localize(node.region, "name") || t("Position")}
          </small>
        </span>
      </button>
      {open &&
        children.map((child) => (
          <Node
            key={child.id}
            node={child}
            childrenByParent={childrenByParent}
          />
        ))}
    </div>
  );
}

export default function Organogram() {
  const { organogram: allNodes, regions, selectedRegionId } = usePortal();
  const { t, localize, language } = useLanguage();
  const [regionId, setRegionId] = useState(selectedRegionId || "jaipur");
  const activeRegion =
    regions.find((region) => region.id === regionId) ||
    regions.find((region) => region.id === "jaipur") ||
    regions[0] ||
    null;
  const currentRegionId = activeRegion?.id || "jaipur";

  // Organogram is deliberately strict: only records assigned to the chosen
  // region are shown. Null-region/shared records must not leak across tabs.
  const organogram = useMemo(
    () => allNodes.filter((node) => node.regionId === currentRegionId),
    [allNodes, currentRegionId],
  );
  const childrenByParent = useMemo(() => {
    const map = new Map();
    const ids = new Set(organogram.map((node) => node.id));
    organogram.forEach((node) => {
      const parent =
        node.parentId && ids.has(node.parentId) ? node.parentId : "root";
      map.set(parent, [...(map.get(parent) || []), node]);
    });
    return map;
  }, [organogram]);
  const roots = childrenByParent.get("root") || [];
  const files = organogram.filter(
    (node) =>
      node.fileUrl || node.documentUrl || node.imageUrl || node.storageKey,
  );

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span style={{color:"#007dcb"}} className="eyebrow">{t("PEOPLE & STRUCTURE")}</span>
          <h1>{t("Organogram")}</h1>
          <p>{t("Expandable organizational hierarchy.")}</p>
        </div>
        <span className="large-module-icon">
          <Network size={30} />
        </span>
      </div>

      <div
        className="organogram-region-tabs"
        role="tablist"
        aria-label={t("Organogram regions")}
      >
        {regions.map((region) => (
          <button
            type="button"
            role="tab"
            aria-selected={currentRegionId === region.id}
            className={currentRegionId === region.id ? "active" : ""}
            key={region.id}
            onClick={() => setRegionId(region.id)}
          >
            {language === "hi" ? region.nameHi || region.name : region.name}
          </button>
        ))}
      </div>

      {files.map((file) => {
        const url =
          file.fileUrl || file.documentUrl || file.imageUrl || file.storageKey;
        const isImage = (file.mimeType || url).match(
          /image|\\.(png|jpe?g|webp|gif)(\\?|$)/i,
        );
        return (
          <section className="organogram-file-card" key={`file-${file.id}`}>
            <div>
              <FileText size={20} />
              <b>{file.fileName || file.name || t("Regional organogram")}</b>
              <a href={url} download className="btn btn-outline small">
                <Download size={15} /> {t("Download")}
              </a>
            </div>
            {isImage ? (
              <img src={url} alt={file.fileName || t("Organogram")} />
            ) : (
              <iframe src={url} title={file.fileName || t("Organogram PDF")} />
            )}
          </section>
        );
      })}

      {/* <div className="organogram-panel">
        <div className="tree-root"><Network size={18} /> {t("ORGANIZATIONAL STRUCTURE")} · {activeRegion?.name || ""}</div>
        {roots.map((node) => <Node key={node.id} node={node} childrenByParent={childrenByParent} />)}
      </div> */}
      {!organogram.length && (
        <p className="empty-state">
          {t(
            "The approved organogram has not been added yet. Admin can create the structure from the Organogram section.",
          )}
        </p>
      )}
    </div>
  );
}
