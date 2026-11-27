
import React, { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  Users,
  Eye,
  X,
  Loader2,
} from "lucide-react";

import * as XLSX from "../vendor/xlsx.js";

import { usePortal } from "../context/PortalContext";
import { useLanguage } from "../context/LanguageContext";
import RegionSwitcher from "../components/RegionSwitcher";

export default function Directory() {
  const { selectedRegion } = usePortal();
  const { t, localize } = useLanguage();

  const uploadedFiles = selectedRegion?.directoryFiles || [];
  const legacyFileUrl = selectedRegion?.directoryFileUrl || "";

  const [viewFile, setViewFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const getFileType = (file) => {
    const name = file.fileName || file.name || file.fileUrl || "";

    const extension = name
      .split("?")[0]
      .split("#")[0]
      .split(".")
      .pop()
      .toLowerCase();

    if (["xlsx", "xls", "xlsm"].includes(extension)) {
      return "excel";
    }

    if (extension === "csv") {
      return "csv";
    }

    if (extension === "pdf") {
      return "pdf";
    }

    return "other";
  };

  const handleView = (file) => {
    setViewFile(file);
    setFileData([]);
    setSheetNames([]);
    setCurrentSheet(0);
    setError("");
  };

  // Load Excel or CSV file
  useEffect(() => {
    if (!viewFile) return;

    const type = getFileType(viewFile);

    if (type !== "excel" && type !== "csv") return;

    let cancelled = false;

    const loadSpreadsheet = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(viewFile.fileUrl);

        if (!response.ok) {
          throw new Error("Unable to load file");
        }

        const buffer = await response.arrayBuffer();

        const workbook = XLSX.read(buffer, {
          type: "array",
        });

        if (cancelled) return;

        setSheetNames(workbook.SheetNames);

        const firstSheet = workbook.SheetNames[0];

        if (firstSheet) {
          const worksheet = workbook.Sheets[firstSheet];

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          setFileData(rows);
        }
      } catch {
        if (!cancelled) {
          setError(
            t("Unable to preview file. Please check the file URL or server access.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSpreadsheet();

    return () => {
      cancelled = true;
    };
  }, [viewFile]);

  // Change Excel sheet
  const handleSheetChange = async (index) => {
    if (!viewFile) return;

    setCurrentSheet(index);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(viewFile.fileUrl);

      if (!response.ok) {
        throw new Error("Unable to load file");
      }

      const buffer = await response.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const worksheet = workbook.Sheets[sheetNames[index]];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      setFileData(rows);
    } catch {
      setError(t("Unable to load this sheet."));
    } finally {
      setLoading(false);
    }
  };

  // Download file
  const handleDownload = async (file) => {
    const url = file.fileUrl;
    const fileName = file.fileName || "Telephone-Directory";

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch {
      // Fallback for cross-origin files
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

  const closeModal = () => {
    setViewFile(null);
    setFileData([]);
    setSheetNames([]);
    setError("");
  };

  // Escape key closes modal
  useEffect(() => {
    if (!viewFile) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewFile]);

  const renderSpreadsheet = () => {
    if (loading) {
      return (
        <div className="directory-preview-loading">
          <Loader2 size={32} className="directory-loader" />
          <p>{t("Loading directory...")}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="directory-preview-error">
          {error}
        </div>
      );
    }

    if (!fileData.length) {
      return (
        <div className="directory-preview-empty">
          {t("No data available in this file.")}
        </div>
      );
    }

    return (
      <div className="directory-table-wrapper">
        <table className="directory-preview-table">
          <tbody>
            {fileData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    {cell !== null && cell !== undefined
                      ? String(cell)
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFilePreview = () => {
    if (!viewFile) return null;

    const type = getFileType(viewFile);

    if (type === "excel" || type === "csv") {
      return renderSpreadsheet();
    }

    if (type === "pdf") {
      return (
        <iframe
          className="directory-pdf-preview"
          src={viewFile.fileUrl}
          title={viewFile.fileName || "Telephone Directory"}
        />
      );
    }

    return (
      <div className="directory-preview-error">
        {t("Preview is not supported for this file type. Please download the file.")}
      </div>
    );
  };

  const renderFileItem = (file) => (
    <div
      className="directory-file-item"
      key={file.id || file.fileUrl}
    >
      <div className="directory-file-name">
        <FileSpreadsheet size={22} />
        <span>{file.fileName || "Telephone Directory"}</span>
      </div>

      <div className="directory-file-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleView(file)}
        >
          <Eye size={17} />
          {t("View")}
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleDownload(file)}
        >
          <Download size={17} />
          {t("Download")}
        </button>
      </div>
    </div>
  );

  const legacyFile = legacyFileUrl
    ? {
        id: "legacy-directory",
        fileName: "Telephone Directory",
        fileUrl: legacyFileUrl,
      }
    : null;

  return (
    <div className="container page-content directory-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            {t("PEOPLE & CONTACTS")} · {localize(selectedRegion, "name") || "JAIPUR"}
          </span>

          <h1>{t("Telephone Directory")}</h1>

          <p>
            {t(
              "Download the official telephone directory for this region."
            )}
          </p>
        </div>

        <span className="large-module-icon">
          <Users size={30} />
        </span>
      </div>

      <RegionSwitcher />

      <div className="directory-toolbar">
        {uploadedFiles.length > 0 ? (
          <div className="directory-file-list">
            {uploadedFiles.map(renderFileItem)}
          </div>
        ) : legacyFile ? (
          renderFileItem(legacyFile)
        ) : (
          <p className="directory-file-unavailable">
            {t(
              "No telephone directory file has been uploaded for this region yet."
            )}
          </p>
        )}
      </div>

      {/* Preview Modal */}
      {viewFile && (
        <div
          className="directory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="directory-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="directory-modal-header">
              <div className="directory-modal-title">
                <FileSpreadsheet size={22} />

                <div>
                  <h2>
                    {viewFile.fileName || "Telephone Directory"}
                  </h2>
                  <span>{t("Telephone Directory Preview")}</span>
                </div>
              </div>

              <div className="directory-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleDownload(viewFile)}
                >
                  <Download size={17} />
                  {t("Download")}
                </button>

                <button
                  type="button"
                  className="directory-modal-close"
                  onClick={closeModal}
                  aria-label={t("Close preview")}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {sheetNames.length > 1 && (
              <div className="directory-sheet-tabs">
                {sheetNames.map((name, index) => (
                  <button
                    type="button"
                    key={name}
                    className={
                      currentSheet === index ? "active" : ""
                    }
                    onClick={() => handleSheetChange(index)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            <div className="directory-modal-body">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==============================
   DIRECTORY PAGE CSS
================================ */

const directoryStyles = `
.directory-file-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.directory-file-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.directory-file-actions .btn-secondary {
  background: #ffffff;
  color: #0b3558;
  border: 1px solid #0b3558;
}

.directory-file-actions .btn-secondary:hover {
  background: #0b3558;
  color: #ffffff;
}

.directory-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background: rgba(8, 24, 40, 0.72);
  backdrop-filter: blur(5px);
}

.directory-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  max-height: 900px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

.directory-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 24px;
  background: #0b3558;
  color: #ffffff;
}

.directory-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.directory-modal-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.directory-modal-title span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.75;
}

.directory-modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.directory-modal-actions .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.directory-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
}

.directory-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.directory-sheet-tabs {
  display: flex;
  gap: 4px;
  padding: 10px 18px;
  background: #f1f5f9;
  border-bottom: 1px solid #dbe3ec;
  overflow-x: auto;
}

.directory-sheet-tabs button {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
}

.directory-sheet-tabs button.active {
  background: #0b3558;
  color: #ffffff;
}

.directory-modal-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f8fafc;
}

.directory-pdf-preview {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #ffffff;
}

.directory-table-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #ffffff;
}

.directory-preview-table {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  font-size: 13px;
  color: #1e293b;
}

.directory-preview-table td {
  padding: 10px 14px;
  border: 1px solid #dbe3ec;
  white-space: nowrap;
  min-width: 100px;
}

.directory-preview-table tr:first-child {
  background: #eaf1f7;
  font-weight: 700;
  color: #0b3558;
}

.directory-preview-table tr:hover {
  background: #f1f5f9;
}

.directory-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 15px;
  color: #64748b;
}

.directory-loader {
  animation: directory-spin 1s linear infinite;
}

@keyframes directory-spin {
  to {
    transform: rotate(360deg);
  }
}

.directory-preview-error,
.directory-preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 30px;
  text-align: center;
  color: #64748b;
}

@media (max-width: 650px) {
  .directory-modal-overlay {
    padding: 8px;
  }

  .directory-modal {
    height: 94vh;
    border-radius: 12px;
  }

  .directory-modal-header {
    padding: 12px;
    gap: 10px;
  }

  .directory-modal-title h2 {
    font-size: 14px;
  }

  .directory-modal-title span {
    font-size: 10px;
  }

  .directory-modal-actions {
    gap: 6px;
  }

  .directory-modal-actions .btn-primary {
    padding: 8px 10px;
    font-size: 12px;
  }

  .directory-modal-close {
    width: 34px;
    height: 34px;
  }

  .directory-file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .directory-file-actions {
    width: 100%;
  }

  .directory-file-actions .btn {
    flex: 1;
  }
}
`;

// Inject CSS into the document
if (typeof document !== "undefined") {
  const styleId = "directory-page-inline-styles";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = directoryStyles;
    document.head.appendChild(style);
  }
}
