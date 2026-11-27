import React from "react";
import { MapPin } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
// Pill buttons to pick the region the whole public site is filtered by.
export default function RegionSwitcher({ allowAll = true, value, onChange }) {
  const { publicRegions, regions, selectedRegionId, setSelectedRegion } = usePortal();
  const { t, localize } = useLanguage();
  const current = value !== undefined ? value : selectedRegionId;
  const pick = onChange || setSelectedRegion;
  const choices = publicRegions?.length ? publicRegions : regions.filter((r) => /jaipur|jamnagar/i.test(`${r.id} ${r.name}`));
  if (!choices.length) return null;
  return (
    <div
      className="region-switcher"
      role="tablist"
      aria-label={t("Select Region")}
    >
      <span className="region-switcher-label">
        <MapPin size={15} /> {t("Select Region / IPS")}
      </span>
      {choices.map((r) => (
        <button
          type="button"
          role="tab"
          aria-selected={current === r.id}
          key={r.id}
          className={current === r.id ? "selected" : ""}
          onClick={() => pick(r.id)}
        >
          {localize(r, "name")}
        </button>
      ))}
    </div>
  );
}
