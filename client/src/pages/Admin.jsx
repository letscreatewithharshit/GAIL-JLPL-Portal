import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  FileText,
  Users,
  Image as ImageIcon,
  Building2,
  Network,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Upload,
  RefreshCw,
  LockKeyhole,
  LayoutDashboard,
  Gauge,
  Globe2,
} from "lucide-react";
import api from "../services/api";
import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import { ALL_REGIONS, DOC_CATEGORIES, KEY_FIGURE_SLOTS } from "../constants";
// sections where t("All Regions") is stored as an empty region (shown in every region)
const NULLABLE_REGION = ["highlights", "events", "organogram"];
const sections = [
  [
    "highlights",
    "Highlights",
    Activity,
    [
      ["title", "Title (English)", "text"],
      ["titleHi", "शीर्षक (हिंदी)", "text"],
      ["body", "Description (English)", "textarea"],
      ["bodyHi", "विवरण (हिंदी)", "textarea"],
      // ["category", "Category", "text"],
      ["regionId", "Region", "region"],
      // ["status", "Status", "status"],
    ],
  ],
  [
    "events",
    "Events",
    CalendarDays,
    [
      ["title", "Title (English)", "text"],
      ["titleHi", "शीर्षक (हिंदी)", "text"],
      ["description", "Description (English)", "textarea"],
      ["descriptionHi", "विवरण (हिंदी)", "textarea"],
      ["eventDate", "Date & time", "datetime-local"],
      ["venue", "Venue (English)", "text"],
      ["venueHi", "स्थान (हिंदी)", "text"],
      // ["imageUrl", "Event cover image URL", "text"],
      [
        "imageUrls",
        "Additional event image URLs (managed by uploads)",
        "textarea",
      ],
      ["regionId", "Region", "region"],
      // ["status", "Status", "status"],
    ],
  ],
  [
    "meetings",
    "Meetings",
    CalendarDays,
    [
      ["title", "Title (English)", "text"],
      ["titleHi", "शीर्षक (हिंदी)", "text"],
      ["meetingDate", "Meeting date & time", "datetime-local"],
      ["venue", "Venue (English)", "text"],
      ["venueHi", "स्थान (हिंदी)", "text"],
      ["agenda", "Agenda (English)", "textarea"],
      ["agendaHi", "कार्यसूची (हिंदी)", "textarea"],
      ["minutesUrl", "Meeting URL", "text"],
      ["regionId", "Region", "region"],
      // ["pipelineId", "Pipeline", "pipeline"],
      // ["status", "Status", "status"],
    ],
  ],
  [
    "documents",
    "Documents",
    FileText,
    [
      ["title", "Title (English)", "text"],
      ["titleHi", "शीर्षक (हिंदी)", "text"],
      ["description", "Description (English)", "textarea"],
      ["descriptionHi", "विवरण (हिंदी)", "textarea"],
      ["category", "Document type", "category"],
      ["regionId", "Region", "region"],
      // ["pipelineId", "Pipeline", "pipeline"],
      // ["storageKey", "File URL", "text"],
      // ["status", "Status", "status"],
    ],
  ],
  [
    "directory",
    "Telephone Directory",
    Users,
    [["regionId", "Select Region", "region"]],
  ],
  [
    "gallery",
    "Photo Gallery",
    ImageIcon,
    [
      ["title", "Photo title (English)", "text"],
      ["titleHi", "फोटो शीर्षक (हिंदी)", "text"],
      ["caption", "Caption (English)", "textarea"],
      ["captionHi", "कैप्शन (हिंदी)", "textarea"],
      ["regionId", "Region", "region"],
      ["storageKey", "Image URL", "text"],
    ],
  ],
  [
    "departments",
    "Departments",
    Building2,
    [
      ["code", "Code (e.g. RGMC)", "text"],
      ["name", "Department name (English)", "text"],
      ["nameHi", "विभाग का नाम (हिंदी)", "text"],
      ["description", "Description (English)", "textarea"],
      ["descriptionHi", "विवरण (हिंदी)", "textarea"],
    ],
  ],
  [
    "organogram",
    "Organogram",
    Network,
    [
      ["regionId", "Region", "region"],
      // ["fileName", "File Name", "text"],
      ["name", "", "hidden"],
      ["fileUrl", "", "hidden"],
      ["mimeType", "", "hidden"],
      ["fileSize", "", "hidden"],
    ],
  ],

  [
    "settings",
    "Website Settings",
    Building2,
    [
      ["id", "", "hidden"],
      ["heroVideo", "", "hidden"],
      ["heroImage", "", "hidden"],
    ],
  ],
];
const blank = (fields, scope = ALL_REGIONS, tabId = "") =>
  Object.fromEntries(
    fields.map(([k, , type]) => [
      k,
      k === "status"
        ? "PUBLISHED"
        : k === "isActive"
          ? "true"
          : k === "id" && tabId === "settings"
            ? "main"
            : type === "region"
              ? scope
              : type === "category"
                ? DOC_CATEGORIES[0].value
                : type === "slot"
                  ? "1"
                  : "",
    ]),
  );
// which upload buttons each section shows: [form field, accepted files, label]
const IMG = "image/jpeg,image/png,image/webp";
const VID = "video/mp4,video/webm";
const uploadTargets = {
  documents: [
    ["storageKey", ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.webp,.gif", "document"],
  ],
  gallery: [["storageKey", IMG, "image"]],
  events: [["imageUrl", IMG, "cover image"]],
  organogram: [
    [
      "fileUrl",
      ".pdf,image/jpeg,image/png,image/webp",
      "organogram PDF / image",
    ],
  ],
  regions: [
    ["image", IMG, "image"],
    ["video", VID, "banner video"],
  ],
  settings: [
    ["heroVideo", VID, "banner video"],
    ["heroImage", IMG, "banner image"],
  ],
};
export default function Admin() {
  const { t, language, setLanguage } = useLanguage();
  const portal = usePortal();
  const [token, setToken] = useState(
    sessionStorage.getItem("gail_admin_token") || "",
  );
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("highlights");
  // t("All") tab (ALL_REGIONS) or one region id. Preselects the Region field and filters the list.
  const [scope, setScope] = useState("jaipur");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const section = sections.find((s) => s[0] === tab) || sections[0];
  useEffect(() => {
    if (portal.regions.length && scope === "jaipur") {
      const jaipur = portal.regions.find((r) =>
        /jaipur/i.test(`${r.id} ${r.name}`),
      );
      if (jaipur) setScope(jaipur.id);
    }
  }, [portal.regions, scope]);
  const hasRegionField = section[3].some(([, , type]) => type === "region");
  async function loadRows() {
    if (!token) return;
    try {
      const r = await api.get(`/admin/${tab}`);
      setRows(r.data);
    } catch (e) {
      setMessage(e.response?.data?.error || t("Records could not be loaded."));
    }
  }
  useEffect(() => {
    if (tab !== "directory") loadRows();
    setForm(blank(section[3], scope, tab));
    setEditing(null);
  }, [tab, token, scope]);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await api.post("/auth/login", { username, password });
      sessionStorage.setItem("gail_admin_token", r.data.token);
      setToken(r.data.token);
      setPassword("");
      setMessage(t("Login successful."));
    } catch (e) {
      setMessage(
        e.response?.data?.error ||
          t("Login failed. Check API and credentials."),
      );
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    sessionStorage.removeItem("gail_admin_token");
    setToken("");
    setRows([]);
    setMessage(t("You have signed out."));
  }
  function edit(row) {
    setEditing(row.id);
    const next = { ...blank(section[3], scope, tab) };
    for (const [k] of section[3]) {
      let v = row[k] ?? "";
      if (k === "availableRegions" && Array.isArray(v)) v = v.join(", ");
      if (k === "imageUrls" && Array.isArray(v)) v = JSON.stringify(v);
      if (k === "isActive") v = String(v);
      if (k === "slot") v = String(v || 1);
      if (k === "regionId" && !v && NULLABLE_REGION.includes(tab))
        v = ALL_REGIONS;
      if (["eventDate", "meetingDate"].includes(k) && v) {
        const date = new Date(v);
        v = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }
      next[k] = v;
    }
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = { ...form };
      // Backend's Organogram model requires `name`; derive it from uploaded file
      // so users do not need to fill an extra field in the simplified admin UI.
      if (tab === "organogram" && !String(payload.name || "").trim()) {
        payload.name = String(payload.fileName || "Organogram").replace(/\.[^.]+$/, "");
      }
      for (const k of ["pipelineId", "departmentId", "parentId"])
        if (payload[k] === "") payload[k] = null;
      if (payload.regionId === "") payload.regionId = null;
      if (tab === "events" && typeof payload.imageUrls === "string") {
        try {
          payload.imageUrls = JSON.parse(payload.imageUrls || "[]");
        } catch {
          payload.imageUrls = payload.imageUrls ? [payload.imageUrls] : [];
        }
      }
      for (const k of ["eventDate", "meetingDate"])
        if (payload[k]) payload[k] = new Date(payload[k]).toISOString();
      let result;
      if (editing) await api.put(`/admin/${tab}/${editing}`, payload);
      else result = await api.post(`/admin/${tab}`, payload);
      const regionName = (id) => {
        const region = portal.regions.find((r) => r.id === id);
        return language === "hi"
          ? region?.nameHi || region?.name || id
          : region?.name || id;
      };
      setMessage(
        editing
          ? t("Record updated.")
          : payload.regionId === ALL_REGIONS
            ? NULLABLE_REGION.includes(tab)
              ? t(
                  "Record added for All Regions (it will show in every region).",
                )
              : `${t("Record added to all")} ${result?.data?.count ?? ""} ${t("regions.")}`
            : payload.regionId
              ? `${t("Record added to")} ${regionName(payload.regionId)}.`
              : t("Record added."),
      );
      setForm(blank(section[3], scope, tab));
      setEditing(null);
      await loadRows();
      await portal.refresh();
    } catch (e) {
      setMessage(
        e.response?.data?.error ||
          t("Could not save record. Check required fields."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!window.confirm(t("Delete this record permanently?"))) return;
    try {
      await api.delete(`/admin/${tab}/${id}`);
      setMessage(t("Record deleted."));
      await loadRows();
      await portal.refresh();
    } catch (e) {
      setMessage(e.response?.data?.error || t("Delete failed."));
    }
  }
  async function uploadFile(file, targetField = "storageKey") {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    setBusy(true);
    try {
      const uploadEndpoint =
        targetField === "fileUrl"
          ? "/uploads/organogram"
          : targetField === "imageUrl"
            ? "/uploads/images"
            : "/uploads";
      const r = await api.post(uploadEndpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({
        ...f,
        [targetField]: r.data.url,
        ...(["storageKey", "fileUrl"].includes(targetField)
          ? {
              fileName: r.data.fileName,
              // Organogram API requires a name even though the admin form hides it.
              ...(tab === "organogram"
                ? {
                    name: (r.data.fileName || file.name).replace(/\.[^.]+$/, ""),
                  }
                : {}),
              mimeType: r.data.mimeType,
              fileSize: r.data.fileSize,
            }
          : {}),
      }));
      setMessage(`${t("Uploaded:")} ${r.data.fileName}`);
    } catch (e) {
      setMessage(e.response?.data?.error || t("Upload failed."));
    } finally {
      setBusy(false);
    }
  }
  async function uploadEventPhotos(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const response = await api.post("/uploads/images", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        urls.push(response.data.url);
      }
      setForm((current) => {
        let existing = [];
        try {
          existing = JSON.parse(current.imageUrls || "[]");
        } catch {
          existing = current.imageUrls ? [current.imageUrls] : [];
        }
        return {
          ...current,
          imageUrls: JSON.stringify([...existing, ...urls]),
        };
      });
      setMessage(`${urls.length} ${t("event photo(s) uploaded.")}`);
    } catch (e) {
      setMessage(e.response?.data?.error || t("Event photo upload failed."));
    } finally {
      setBusy(false);
    }
  }
  // list is filtered by the region tab (the All tab lists everything)
  const visibleRows = useMemo(() => {
    if (!hasRegionField || scope === ALL_REGIONS) return rows;
    return rows.filter(
      (r) =>
        r.regionId === scope || (!r.regionId && NULLABLE_REGION.includes(tab)),
    );
  }, [rows, scope, hasRegionField, tab]);
  const counts = useMemo(
    () =>
      sections.map((s) => ({
        label: s[1],
        count: s[0] === tab ? rows.length : undefined,
      })),
    [tab, rows],
  );
  if (!token)
    return (
      <div className="admin-page">
        <div className="admin-login-wrap">
          <form className="admin-login" onSubmit={login}>
            <div className="login-icon">
              <LockKeyhole />
            </div>
            <span className="eyebrow">{t("GAIL REGIONAL PORTAL")}</span>
            <h2>{t("Admin Login")}</h2>
            <p>{t("Sign in to add, edit and publish website information.")}</p>
            <label>{t("Admin username")}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <label>{t("Password")}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
            <button className="btn btn-primary full" disabled={busy}>
              {busy ? t("Please wait…") : t("Sign in")}
            </button>
            {message && <p className="form-message">{message}</p>}
            <small>
              {t(
                "A secure admin account. No employee accounts or role management.",
              )}
            </small>
            <p>
              <a href="/">← {t("Back to website")}</a>
            </p>
          </form>
        </div>
      </div>
    );
  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-mark">GAIL</div>
          <div>
            <b>{t("Portal Admin")}</b>
            <small>{t("Single administrator")}</small>
          </div>
        </div>
        <div className="admin-nav-label">{t("Content Management")}</div>
        {sections.map(([id, label, Icon]) => (
          <button
            key={id}
            className={tab === id ? "admin-nav active" : "admin-nav"}
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {t(label)}
          </button>
        ))}
        <div className="admin-side-bottom">
          <LockKeyhole size={16} /> {t("Protected admin area")}
          <br />
          <small>
            {t("Signed in as")} {username}
          </small>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">{t("GAIL REGIONAL PORTAL")}</span>
            <h1>{t("Content Administration")}</h1>
          </div>
          <div className="admin-top-actions">
            <button
              type="button"
              className="btn btn-outline small"
              title={language === "hi" ? "Switch to English" : "हिंदी में बदलें"}
              onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            >
              <Globe2 size={15} /> {language === "hi" ? "English" : "हिंदी"}
            </button>
            <a className="btn btn-outline small" href="/">
              {t("View website")}
            </a>
            <button className="btn btn-outline small" onClick={logout}>
              <LogOut size={15} /> {t("Sign out")}
            </button>
          </div>
        </header>
        <div className="admin-content">
          <div className="admin-welcome">
            <div>
              <h2>{t(section[1])}</h2>
              <p>
                {tab === "directory" ? (
                  t("Select a region and upload its Excel telephone directory.")
                ) : (
                  <>
                    {t("Add, update, publish or remove")}{" "}
                    {t(section[1]).toLowerCase()}.
                    {t("Fill in both English and Hindi fields.")}
                  </>
                )}
              </p>
            </div>
            {tab !== "directory" && (
              <span className="status-tag">
                {visibleRows.length} {t("records")}
              </span>
            )}
          </div>
          {hasRegionField && tab !== "directory" && (
            <div className="admin-scope">
              <span className="admin-scope-label">
                <Globe2 size={15} /> {t("Region")}
              </span>
              <button
                type="button"
                className={scope === ALL_REGIONS ? "selected" : ""}
                onClick={() => setScope(ALL_REGIONS)}
              >
                {t("All")}
              </button>
              {portal.regions.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className={scope === r.id ? "selected" : ""}
                  onClick={() => setScope(r.id)}
                >
                  {language === "hi" ? r.nameHi || r.name : r.name}
                </button>
              ))}
              <small>
                {scope === ALL_REGIONS
                  ? t("New records are added to every region.")
                  : `${t("New records are added to")} ${language === "hi" ? portal.regions.find((r) => r.id === scope)?.nameHi || portal.regions.find((r) => r.id === scope)?.name || scope : portal.regions.find((r) => r.id === scope)?.name || scope} ${t("only and show only in that region.")}`}
              </small>
            </div>
          )}
          {message && <p className="form-message admin-message">{message}</p>}
          <div className="admin-panel">
            <div className="panel-title">
              <h3>
                {tab === "directory"
                  ? t("Upload Telephone Directory")
                  : editing
                    ? t("Edit record")
                    : t("Add new record")}
              </h3>
              {editing && tab !== "directory" && (
                <button
                  className="btn btn-outline small"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(blank(section[3], scope, tab));
                  }}
                >
                  {t("Cancel edit")}
                </button>
              )}
            </div>
            <form
              className="admin-data-form"
              onSubmit={tab === "directory" ? (e) => e.preventDefault() : save}
            >
              <div className="admin-fields">
                {section[3].map(([key, label, type]) => (
                  type === "hidden" ? (
                    <input
                      key={key}
                      type="hidden"
                      value={form[key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  ) : (
                  <label key={key}>
                    {t(label)}
                    {type === "textarea" ? (
                      <textarea
                        rows="3"
                        required={key !== "parentId"}
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      />
                    ) : type === "region" ? (
                      <select
                        value={form[key] ?? ""}
                        required={key !== "parentId" && key !== "pipelineId"}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            [key]: e.target.value,
                            pipelineId: "",
                          }))
                        }
                      >
                        {tab !== "directory" &&
                          (!editing || NULLABLE_REGION.includes(tab)) && (
                            <option value={ALL_REGIONS}>
                              {t("All Regions (add to every region)")}
                            </option>
                          )}
                        {editing && !form[key] && (
                          <option value="">{t("Select region")}</option>
                        )}
                        {portal.regions.map((r) => (
                          <option value={r.id} key={r.id}>
                            {language === "hi" ? r.nameHi || r.name : r.name}
                          </option>
                        ))}
                      </select>
                    ) : type === "category" ? (
                      <select
                        value={form[key] ?? ""}
                        required={key !== "parentId" && key !== "pipelineId"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        {DOC_CATEGORIES.map((c) => (
                          <option value={c.value} key={c.value}>
                            {language === "hi" ? c.hi || t(c.value) : c.value}
                          </option>
                        ))}
                        {form[key] &&
                          !DOC_CATEGORIES.some(
                            (c) => c.value === form[key],
                          ) && (
                            <option value={form[key]}>
                              {form[key]} {t("(old)")}
                            </option>
                          )}
                      </select>
                    ) : type === "slot" ? (
                      <select
                        value={String(form[key] ?? "1")}
                        required
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        {KEY_FIGURE_SLOTS.map((k) => (
                          <option value={String(k.slot)} key={k.slot}>
                            {k.slot} –{" "}
                            {language === "hi" ? k.hi || k.label : k.label}
                          </option>
                        ))}
                      </select>
                    ) : type === "pipeline" ? (
                      <select
                        value={form[key] ?? ""}
                        required={key !== "parentId" && key !== "pipelineId"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="">{t("No pipeline")}</option>
                        {portal.regions
                          .filter(
                            (r) =>
                              !form.regionId ||
                              form.regionId === ALL_REGIONS ||
                              r.id === form.regionId,
                          )
                          .flatMap((r) =>
                            r.pipelines.map((p) => (
                              <option key={p.id} value={p.id}>
                                {language === "hi"
                                  ? r.nameHi || r.name
                                  : r.name}{" "}
                                —{" "}
                                {language === "hi"
                                  ? p.nameHi || p.name
                                  : p.name}
                              </option>
                            )),
                          )}
                      </select>
                    ) : type === "department" ? (
                      <select
                        value={form[key] ?? ""}
                        required={key !== "parentId" && key !== "pipelineId"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="">{t("Select department")}</option>
                        {portal.departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {language === "hi" ? d.nameHi || d.name : d.name}
                          </option>
                        ))}
                      </select>
                    ) : type === "parent" ? (
                      <select
                        value={form[key] ?? ""}
                        required={key !== "parentId" && key !== "pipelineId"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="">{t("Top-level node")}</option>
                        {rows
                          .filter((r) => r.id !== editing)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {language === "hi" ? r.nameHi || r.name : r.name}{" "}
                              ({r.id.slice(0, 7)})
                            </option>
                          ))}
                      </select>
                    ) : type === "status" ? (
                      <select
                        value={form[key] ?? "PUBLISHED"}
                        required
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="DRAFT">{t("Draft")}</option>
                        <option value="PUBLISHED">{t("Published")}</option>
                        <option value="ARCHIVED">{t("Archived")}</option>
                      </select>
                    ) : type === "boolean" ? (
                      <select
                        value={String(form[key] ?? "true")}
                        required
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="true">{t("Yes")}</option>
                        <option value="false">{t("No")}</option>
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        required={key !== "parentId"}
                      />
                    )}
                  </label>
                  )
                ))}
              </div>
              {(uploadTargets[tab] || []).map(([field, accept, what]) => (
                <label className="upload-control" key={field}>
                  <Upload size={17} /> {t("Upload")} {t(what)}
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                      uploadFile(e.target.files?.[0], field);
                      e.target.value = "";
                    }}
                  />
                  <small>
                    {accept === VID
                      ? t("MP4 or WebM video, maximum 100 MB.")
                      : accept === IMG
                        ? t("JPG, PNG or WebP image, maximum 100 MB.")
                        : t("PDF / Office files or images, maximum 100 MB.")}
                  </small>
                </label>
              ))}
              {(uploadTargets[tab] || []).map(
                ([field]) =>
                  form[field] && (
                    <p className="form-message" key={`up-${field}`}>
                      {field}: {form[field]}
                    </p>
                  ),
              )}
              {tab === "events" && (
                <label className="upload-control">
                  <Upload size={17} /> {t("Upload multiple event photos")}
                  <input
                    type="file"
                    accept={IMG}
                    multiple
                    onChange={(e) => {
                      uploadEventPhotos(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <small>
                    {t(
                      "Select multiple JPG, PNG or WebP photographs. Their URLs are saved with the event.",
                    )}
                  </small>
                </label>
              )}
              {tab === "directory" && (
                <>
                  <label className="upload-control">
                    <Upload size={17} /> {t("Upload Telephone Directory Files")}
                    <input
                      required
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      multiple
                      disabled={
                        busy || !form.regionId || form.regionId === ALL_REGIONS
                      }
                      onChange={async (event) => {
                        const selectedFiles = Array.from(
                          event.target.files || [],
                        );
                        if (!selectedFiles.length) return;
                        const regionId = form.regionId;
                        if (!regionId || regionId === ALL_REGIONS) {
                          setMessage(
                            t("Please select one specific region first."),
                          );
                          event.target.value = "";
                          return;
                        }
                        const body = new FormData();
                        selectedFiles.forEach((file) =>
                          body.append("files", file),
                        );
                        body.append("regionId", regionId);
                        try {
                          setBusy(true);
                          setMessage("");
                          const response = await api.post(
                            "/admin/directory/import",
                            body,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                          setMessage(
                            response.data?.message ||
                              t(
                                "Telephone Directory files uploaded successfully.",
                              ),
                          );
                          await portal.refresh();
                        } catch (error) {
                          setMessage(
                            error.response?.data?.error ||
                              t("Excel file upload failed."),
                          );
                        } finally {
                          setBusy(false);
                          event.target.value = "";
                        }
                      }}
                    />
                    <small>
                      {t(
                        "Select multiple .xlsx, .xls or .csv files at once. Files are added to the selected region; existing files are not replaced.",
                      )}
                    </small>
                  </label>
                  {(() => {
                    const selectedRegion = portal.regions.find(
                      (region) => region.id === form.regionId,
                    );
                    const uploadedFiles = selectedRegion?.directoryFiles || [];
                    return uploadedFiles.length > 0 ? (
                      <div className="admin-record-list">
                        <b>
                          {t("Uploaded files for")}{" "}
                          {language === "hi"
                            ? selectedRegion.nameHi || selectedRegion.name
                            : selectedRegion.name}
                        </b>
                        {uploadedFiles.map((file) => (
                          <div className="admin-record" key={file.id}>
                            <div>
                              <b>{file.fileName}</b>
                              <small>
                                {new Date(file.createdAt).toLocaleString()}
                              </small>
                            </div>
                            <a
                              className="btn btn-outline small"
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("View file")}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </>
              )}
              {tab !== "directory" && (
                <button className="btn btn-primary" disabled={busy}>
                  {busy
                    ? t("Saving…")
                    : editing
                      ? t("Update record")
                      : t("Save record")}{" "}
                  <Plus size={16} />
                </button>
              )}
            </form>
          </div>
          {tab !== "directory" && (
            <div className="admin-panel">
              <div className="panel-title">
                <h3>{t("Existing records")}</h3>
                <button className="btn btn-outline small" onClick={loadRows}>
                  <RefreshCw size={14} /> {t("Refresh")}
                </button>
              </div>
              {visibleRows.length === 0 ? (
                <div className="admin-placeholder">
                  <LayoutDashboard size={24} />
                  <b>{t("No records found")}</b>
                  <span>{t("Add the first record using the form above.")}</span>
                </div>
              ) : (
                <div className="admin-record-list">
                  {visibleRows.map((row) => (
                    <div className="admin-record" key={row.id}>
                      <div>
                        <b>
                          {row.slot ? `#${row.slot} ` : ""}
                          {(language === "hi"
                            ? row.titleHi || row.nameHi || row.labelHi
                            : row.title || row.name || row.label) ||
                            row.code ||
                            t("Record")}
                        </b>
                        {hasRegionField && (
                          <small className="record-region">
                            <Globe2 size={12} />{" "}
                            {(language === "hi"
                              ? row.region?.nameHi || row.region?.name
                              : row.region?.name) ||
                              (NULLABLE_REGION.includes(tab) && !row.regionId
                                ? t("All Regions")
                                : row.regionId || "—")}
                          </small>
                        )}
                        <small>
                          {row.category ||
                            row.value ||
                            (language === "hi"
                              ? row.designationHi || row.designation
                              : row.designation) ||
                            (language === "hi"
                              ? row.descriptionHi || row.description
                              : row.description) ||
                            row.status ||
                            row.id}
                        </small>
                        <small className="record-id">
                          {t("ID")}: {row.id}
                        </small>
                      </div>
                      <div className="record-actions">
                        <button title={t("Edit")} onClick={() => edit(row)}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title={t("Delete")}
                          onClick={() => remove(row.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
