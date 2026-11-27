import React from "react";
// import gailLogo from "../images/GAIL#U2019s Greener Energy Tomorrow.png";
import { useLanguage } from "../context/LanguageContext";
export default function Brand({ compact = false }) {
  const { t } = useLanguage();
  return (
    <div className="brand-lockup">
      <div>
        <img
          style={{
            height: "3.1rem",
            width: "5.1rem",
            objectFit: "contain",
            objectPosition: "left center",
          }}
          src={
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/GAIL.svg/960px-GAIL.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20160501111448"
          }
          alt={t("GAIL India logo")}
        />
      </div>
      <div className="brand-copy">
        <strong>{t("GAIL (India) Limited")}</strong>
        {!compact && (
          <span>{t("JLPL Regional Operations & Maintenance Portal")}</span>
        )}
      </div>
    </div>
  );
}
