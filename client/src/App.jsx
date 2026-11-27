import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Region from "./pages/Region";
import Module from "./pages/Module";
import Departments from "./pages/Departments";
import Organogram from "./pages/Organogram";
import Meetings from "./pages/Meetings";
import EventDetail from "./pages/EventDetail";
import Calendar from "./pages/Calendar";
import Directory from "./pages/Directory";
import Gallery from "./pages/Gallery";
import Documents from "./pages/Documents";
import KeyFigures from "./pages/KeyFigures";
import Admin from "./pages/Admin";
import { useLanguage } from "./context/LanguageContext";
function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="container page-content">
      <h1>{t("Page not found")}</h1>
      <p>{t("The page you requested could not be found.")}</p>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/regions/:regionId" element={<Region />} />
              <Route
                path="/regions/:regionId/modules/:moduleId"
                element={<Module />}
              />
              <Route path="/key-figures" element={<KeyFigures />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/organogram" element={<Organogram />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
