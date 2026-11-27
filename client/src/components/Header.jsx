import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, ChevronDown, Shield } from "lucide-react";
import Brand from "./Brand";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
export default function Header() {
  const { publicRegions, regions, selectedRegion, setSelectedRegion } = usePortal();
  const location = useLocation();
  const navigate = useNavigate();
  const chooseRegion = (id) => {
    setSelectedRegion(id);
    setRegionOpen(false);
    setOpen(false);
    // if a region page is open, move to the newly chosen region's page
    if (/^\/regions\//.test(location.pathname)) navigate(id ? `/regions/${id}` : "/");
  };
  const regionChoices = publicRegions?.length ? publicRegions : regions.filter((r) => /jaipur|jamnagar/i.test(`${r.id} ${r.name}`));
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  
  const nav = [
    ["Home", "/"],
    ["Departments", "/departments"],
    ["Organogram", "/organogram"],
    ["Meetings", "/meetings"],
    ["Telephone Directory", "/directory"],
    ["Photo Gallery", "/gallery"],
  ];
  return (
    <header   className="site-header">
      <div className="header-top">
        <div className="container header-inner">
          <Link to="/" className="brand-link">
            <Brand />
          </Link>
          <div className="header-actions">
            <span className="intranet-label">
              <span className="live-dot" /> {t("Regional information portal")}
            </span>
            <div className="language-switch" aria-label={t("Choose language")}>
              <button
                type="button"
                className={language === "en" ? "selected" : ""}
                onClick={() => setLanguage("en")}
              >
                ENG
              </button>
              <span>|</span>
              <button
                type="button"
                className={language === "hi" ? "selected" : ""}
                onClick={() => setLanguage("hi")}
              >
                हिंदी
              </button>
            </div>
            {/* <Link className="admin-link" to="/admin">
              <Shield size={15} /> {t("Admin")}
            </Link> */}
          </div>
          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label={t("Toggle menu")}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div style={{borderBottomLeftRadius:"100px", borderBottomRightRadius:"100px"}} className={`nav-wrap ${open ? "nav-open" : ""}`}>
        <nav style={{display:"flex", justifyContent:"center"}} className="container main-nav">
          {nav.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              end={path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {t(label)}
            </NavLink>
          ))}
          <div className="region-menu">
            <button
              className="nav-item region-trigger"
              onClick={() => setRegionOpen(!regionOpen)}
            >
              {selectedRegion
                ? (language === "hi" ? selectedRegion.nameHi || selectedRegion.name : selectedRegion.name)
                : t("Select IPS / Region")}{" "}
              <ChevronDown size={15} />
            </button>
            {regionOpen && (
              <div className="region-dropdown">
                {regionChoices.map((r) => (
                  <a
                    key={r.id}
                    href={`#${r.id}`}
                    className={selectedRegion?.id === r.id ? "selected" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      chooseRegion(r.id);
                    }}
                  >
                    {language === "hi" ? r.nameHi || r.name : r.name}
                  </a>
                ))}
              </div>
            )}
          </div>
      
          <Link
            className="mobile-admin"
            to="/admin"
            onClick={() => setOpen(false)}
          >
            <Shield size={15} /> {t("Admin Dashboard")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
