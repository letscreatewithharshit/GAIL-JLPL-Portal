import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, ExternalLink } from "lucide-react";
import Brand from "./Brand";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
export default function Footer() {
  const { regions } = usePortal();
  const { t, localize } = useLanguage();
  return (
    <footer style={{borderTopLeftRadius:"100px", borderTopRightRadius:"100px"}} className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Brand />
          <p>
            {t(
              "A unified regional information space for Operations & Maintenance teams. Regional information and resources for Operations & Maintenance teams.",
            )}
          </p>
          <span className="footer-note">
            {t("Internal use subject to organizational approval.")}
          </span>
        </div>
        <div>
          <h4>{t("Quick Links")}</h4>
          <Link to="/meetings">{t("Meetings")}</Link>
          <Link to="/directory">{t("Telephone Directory")}</Link>
          <Link to="/gallery">{t("Photo Gallery")}</Link>
          <Link to="/admin">{t("Administration")}</Link>
        </div>
        <div>
          <h4>{t("ED Regions")}</h4>
          {regions.map((r) => (
            <Link key={r.id} to={`/regions/${r.id}`}>
              {localize(r, "name")}
            </Link>
          ))}
        </div>
        <div>
          <h4>{t("Portal Support")}</h4>
          <p>
            <Mail size={15} /> {t("Contact your regional portal administrator")}
          </p>
          <p>
            <MapPin size={15} /> {t("GAIL Regional Operations")}
          </p>
          <span className="footer-note">
            {t("Replace with approved official contact details.")}
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} {t("GAIL Regional O&M Portal")}</span>
          <span>{t("Designed for desktop, tablet and mobile")}</span>
        </div>
      </div>
    </footer>
  );
}
