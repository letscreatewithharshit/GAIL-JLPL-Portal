import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Network } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
export default function RegionCard({ region }) {
  const { localize, t } = useLanguage();
  const pipes =
    region.pipelineNames ||
    region.pipelines?.map((p) => (typeof p === "string" ? p : p.name)) ||
    [];
  return (
    <Link to={`/regions/${region.id}`} className="region-card">
      <div
        className="region-card-image"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(15,25,39,.05),rgba(15,25,39,.72)),url(${region.image|| "https://www.gailonline.com/img/image_posilities.jpg" || ""})`,
        }}
      >
        <span className="region-tag">{t("ED REGION")}</span>
        <h3>{localize(region, "name")}</h3>
        <span className="region-open">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="region-card-body">
        <p>{localize(region, "description")}</p>
        <div className="pipeline-list">
          <Network size={15} />
          {pipes.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
