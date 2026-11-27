import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
]);
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`,
    ),
});
const makeUploader = (mimeTypes) => multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    mimeTypes.has(file.mimetype) ? cb(null, true) : cb(new Error("Unsupported file type")),
});
const uploader = makeUploader(allowed);
const imageUploader = makeUploader(new Set(["image/jpeg", "image/png", "image/webp"]));
const organogramUploader = makeUploader(new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]));
const publicStatus = { status: "PUBLISHED" };

router.get("/portal", async (req, res, next) => {
  try {
    const [
      settings,
      regions,
      departments,
      modules,
      highlights,
      events,
      meetings,
      documents,
      directory,
      gallery,
      organogram,
      keyFigures,
    ] = await Promise.all([
      prisma.portalSetting.findUnique({ where: { id: "main" } }),
      prisma.region.findMany({
        include: {
          pipelines: true,
          directoryFiles: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.department.findMany({ orderBy: { name: "asc" } }),
      prisma.portalModule.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.highlight.findMany({
        where: publicStatus,
        include: { region: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.event.findMany({
        where: publicStatus,
        include: { region: true },
        orderBy: { eventDate: "asc" },
        take: 200,
      }),
      prisma.meeting.findMany({
        where: publicStatus,
        include: { region: true, pipeline: true },
        orderBy: { meetingDate: "asc" },
        take: 200,
      }),
      prisma.document.findMany({
        where: publicStatus,
        include: { region: true, pipeline: true },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
      prisma.employee.findMany({
        include: { region: true, pipeline: true, department: true },
        orderBy: { name: "asc" },
        take: 500,
      }),
      prisma.galleryImage.findMany({
        include: { region: true },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
      prisma.organogramNode.findMany({
        include: { region: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.keyFigure.findMany({
        orderBy: [{ regionId: "asc" }, { slot: "asc" }],
      }),
    ]);
    res.json({
      settings,
      regions,
      departments,
      modules,
      highlights,
      events,
      meetings,
      documents,
      directory,
      gallery,
      organogram,
      keyFigures,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/calendar", async (req, res, next) => {
  try {
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = req.query.to
      ? new Date(String(req.query.to))
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from >= to
    )
      return res
        .status(400)
        .json({ error: "Valid from and to dates are required." });
    const regionId = req.query.regionId
      ? String(req.query.regionId)
      : undefined;
    const [events, meetings] = await Promise.all([
      prisma.event.findMany({
        where: {
          ...publicStatus,
          eventDate: { gte: from, lt: to },
          ...(regionId ? { regionId } : {}),
        },
        include: { region: true },
        orderBy: { eventDate: "asc" },
      }),
      prisma.meeting.findMany({
        where: {
          ...publicStatus,
          meetingDate: { gte: from, lt: to },
          ...(regionId ? { regionId } : {}),
        },
        include: { region: true, pipeline: true },
        orderBy: { meetingDate: "asc" },
      }),
    ]);
    res.json({ events, meetings });
  } catch (error) {
    next(error);
  }
});

router.get("/key-figures", async (req, res, next) => {
  try {
    const { regionId } = req.query;
    res.json(
      await prisma.keyFigure.findMany({
        where: regionId ? { regionId: String(regionId) } : {},
        orderBy: [{ regionId: "asc" }, { slot: "asc" }],
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/modules", async (req, res, next) => {
  try {
    res.json(
      await prisma.portalModule.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/pipelines", async (req, res, next) => {
  try {
    res.json(
      await prisma.pipeline.findMany({
        include: { region: true },
        orderBy: { name: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/regions", async (req, res, next) => {
  try {
    res.json(
      await prisma.region.findMany({
        include: { pipelines: true },
        orderBy: { name: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/highlights", async (req, res, next) => {
  try {
    res.json(
      await prisma.highlight.findMany({
        where: publicStatus,
        include: { region: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/meetings", async (req, res, next) => {
  try {
    res.json(
      await prisma.meeting.findMany({
        where: publicStatus,
        include: { region: true, pipeline: true },
        orderBy: { meetingDate: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/events", async (req, res, next) => {
  try {
    res.json(
      await prisma.event.findMany({
        where: publicStatus,
        include: { region: true },
        orderBy: { eventDate: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/documents", async (req, res, next) => {
  try {
    const { regionId, category } = req.query;
    res.json(
      await prisma.document.findMany({
        where: {
          ...publicStatus,
          ...(regionId ? { regionId: String(regionId) } : {}),
          ...(category ? { category: String(category) } : {}),
        },
        include: { region: true, pipeline: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

// Upload multiple original regional telephone directory files. Files are stored
// as separate records; no Excel parsing or Employee table changes are performed.
router.post("/admin/directory/import", requireAuth, (req, res, next) =>
  uploader.array("files", 20)(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ error: uploadError.message || "File upload failed." });
    }

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "Please select one or more Excel/CSV files." });
    }

    const invalidFile = files.find((file) =>
      ![".xlsx", ".xls", ".csv"].includes(path.extname(file.originalname).toLowerCase()),
    );
    if (invalidFile) {
      files.forEach((file) => fs.unlink(file.path, () => {}));
      return res.status(400).json({ error: "Only .xlsx, .xls or .csv files are allowed." });
    }

    try {
      const regionId = String(req.body.regionId || "").trim();
      if (!regionId) {
        files.forEach((file) => fs.unlink(file.path, () => {}));
        return res.status(400).json({ error: "Select a region before uploading files." });
      }

      const region = await prisma.region.findUnique({ where: { id: regionId } });
      if (!region) {
        files.forEach((file) => fs.unlink(file.path, () => {}));
        return res.status(404).json({ error: "Region not found." });
      }

      const savedFiles = await prisma.directoryFile.createMany({
        data: files.map((file) => ({
          regionId,
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          fileSize: file.size,
        })),
      });

      return res.status(201).json({
        message: `${savedFiles.count} telephone directory file(s) uploaded successfully for ${region.name}.`,
        regionId,
        count: savedFiles.count,
        files: files.map((file) => ({
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
        })),
      });
    } catch (error) {
      files.forEach((file) => fs.unlink(file.path, () => {}));
      return next(error);
    }
  }),
);

router.get("/directory", async (req, res, next) => {
  try {
    const { regionId, q } = req.query;
    res.json(
      await prisma.employee.findMany({
        where: {
          ...(regionId ? { regionId: String(regionId) } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: String(q), mode: "insensitive" } },
                  { nameHi: { contains: String(q), mode: "insensitive" } },
                  { designation: { contains: String(q), mode: "insensitive" } },
                  {
                    designationHi: { contains: String(q), mode: "insensitive" },
                  },
                  { email: { contains: String(q), mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: { region: true, pipeline: true, department: true },
        orderBy: { name: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/uploads", requireAuth, (req, res, next) =>
  uploader.single("file")(req, res, (error) => {
    if (error)
      return res.status(400).json({ error: error.message || "Upload failed" });
    if (!req.file)
      return res
        .status(400)
        .json({
          error:
            "Select a supported file (JPG, PNG, WebP, MP4/WebM video, PDF, DOC/DOCX, XLS/XLSX), max 100 MB.",
        });
    res
      .status(201)
      .json({
        url: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      });
  }),
);

router.post("/uploads/images", requireAuth, (req, res) =>
  imageUploader.single("file")(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || "Image upload failed." });
    if (!req.file) return res.status(400).json({ error: "Only JPG, PNG or WebP images are allowed." });
    res.status(201).json({ url: `/uploads/${req.file.filename}`, fileName: req.file.originalname, mimeType: req.file.mimetype, fileSize: req.file.size });
  }),
);
router.post("/uploads/organogram", requireAuth, (req, res) =>
  organogramUploader.single("file")(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || "Organogram upload failed." });
    if (!req.file) return res.status(400).json({ error: "Only PDF, JPG, PNG or WebP files are allowed." });
    res.status(201).json({ url: `/uploads/${req.file.filename}`, fileName: req.file.originalname, mimeType: req.file.mimetype, fileSize: req.file.size });
  }),
);

const configs = {
  highlights: {
    model: prisma.highlight,
    required: ["title", "body"],
    fields: [
      "title",
      "titleHi",
      "body",
      "bodyHi",
      "category",
      "regionId",
      "status",
    ],
  },
  events: {
    model: prisma.event,
    required: ["title", "eventDate"],
    fields: [
      "title",
      "titleHi",
      "description",
      "descriptionHi",
      "eventDate",
      "venue",
      "venueHi",
      "imageUrl",
      "imageUrls",
      "regionId",
      "status",
    ],
  },
  meetings: {
    model: prisma.meeting,
    required: ["title", "meetingDate", "regionId"],
    fields: [
      "title",
      "titleHi",
      "meetingDate",
      "venue",
      "venueHi",
      "agenda",
      "agendaHi",
      "minutesUrl",
      "regionId",
      "pipelineId",
      "status",
    ],
  },
  documents: {
    model: prisma.document,
    required: ["title", "category", "regionId"],
    fields: [
      "title",
      "titleHi",
      "description",
      "descriptionHi",
      "category",
      "fileName",
      "storageKey",
      "mimeType",
      "fileSize",
      "regionId",
      "pipelineId",
      "status",
    ],
  },
  directory: {
    model: prisma.employee,
    required: ["name", "regionId"],
    fields: [
      "name",
      "nameHi",
      "designation",
      "designationHi",
      "phone",
      "email",
      "regionId",
      "pipelineId",
      "departmentId",
    ],
  },
  gallery: {
    model: prisma.galleryImage,
    required: ["title", "storageKey", "regionId"],
    fields: [
      "title",
      "titleHi",
      "caption",
      "captionHi",
      "storageKey",
      "regionId",
    ],
  },
  departments: {
    model: prisma.department,
    required: ["code", "name"],
    fields: ["code", "name", "nameHi", "description", "descriptionHi"],
  },
  organogram: {
    model: prisma.organogramNode,
    required: ["name"],
    fields: [
      "name",
      "nameHi",
      "designation",
      "designationHi",
      "parentId",
      "regionId",
      "sortOrder",
      "fileUrl",
      "fileName",
      "mimeType",
      "fileSize",
    ],
  },
  keyFigures: {
    model: prisma.keyFigure,
    required: ["slot", "value", "regionId"],
    fields: ["slot", "label", "labelHi", "value", "unit", "regionId"],
  },
  regions: {
    model: prisma.region,
    required: ["id", "name"],
    fields: [
      "id",
      "name",
      "nameHi",
      "description",
      "descriptionHi",
      "image",
      "video",
    ],
  },
  pipelines: {
    model: prisma.pipeline,
    required: ["name", "regionId"],
    fields: ["name", "regionId"],
  },
  modules: {
    model: prisma.portalModule,
    required: ["id", "title"],
    fields: [
      "id",
      "title",
      "titleHi",
      "description",
      "descriptionHi",
      "icon",
      "availableRegions",
      "sortOrder",
      "isActive",
    ],
  },
  settings: {
    model: prisma.portalSetting,
    required: ["id"],
    fields: [
      "id",
      "heroTitle",
      "heroTitleHi",
      "heroSubtitle",
      "heroSubtitleHi",
      "heroImage",
      "heroVideo",
      "announcement",
      "announcementHi",
    ],
  },
};

// "All Regions" handling in the admin panel.
// - Sections where the region is optional (highlights, events, organogram) store regionId = null,
//   and the public site shows such records in every region.
// - Sections where the region is mandatory get one copy of the record per region.
const ALL_REGIONS = "__ALL__";
const nullableRegion = new Set(["highlights", "events", "organogram"]);
const fanOut = new Set([
  "meetings",
  "documents",
  "directory",
  "gallery",
  "keyFigures",
  "pipelines",
]);
const KEY_FIGURE_LABELS = [
  "Pipeline Length",
  "Throughput Capacity",
  "Dispatch Terminals",
  "Receipt Terminals (TOPs)",
  "Pumping Stations",
  "States Crossed",
  "Pipe Diameters",
  "Sectionalizing Valves",
];
function createRecord(resource, config, data) {
  if (resource === "keyFigures") {
    return config.model.upsert({
      where: { regionId_slot: { regionId: data.regionId, slot: data.slot } },
      create: data,
      update: data,
    });
  }
  return config.model.create({ data });
}

function payloadFor(config, body) {
  const data = {};
  for (const field of config.fields)
    if (body[field] !== undefined) data[field] = body[field];
  for (const field of ["regionId", "pipelineId", "departmentId", "parentId"])
    if (data[field] === "") data[field] = null;
  if (data.slot !== undefined) {
    data.slot = Number(data.slot);
    if (!Number.isInteger(data.slot) || data.slot < 1 || data.slot > 8)
      throw Object.assign(
        new Error("Key figure slot must be between 1 and 8"),
        { statusCode: 400 },
      );
    if (!data.label) data.label = KEY_FIGURE_LABELS[data.slot - 1];
  }
  if (data.status === undefined && config.fields.includes("status"))
    data.status = "PUBLISHED";
  if (data.status && !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(data.status))
    throw Object.assign(new Error("Invalid publication status"), {
      statusCode: 400,
    });
  for (const field of ["eventDate", "meetingDate"])
    if (data[field]) {
      const parsed = new Date(data[field]);
      if (Number.isNaN(parsed.getTime()))
        throw Object.assign(new Error(`Invalid ${field}`), { statusCode: 400 });
      data[field] = parsed;
    }
  if (data.fileSize !== undefined && data.fileSize !== null)
    data.fileSize = Number(data.fileSize);
  if (data.sortOrder !== undefined)
    data.sortOrder = Number(data.sortOrder) || 0;
  if (typeof data.availableRegions === "string")
    data.availableRegions = data.availableRegions
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  if (data.isActive !== undefined)
    data.isActive = data.isActive === true || data.isActive === "true";
  for (const [key, value] of Object.entries(data))
    if (typeof value === "string" && value.length > 12000)
      throw Object.assign(new Error(`${key} is too long`), { statusCode: 400 });
  return data;
}
function recordWhere(resource, id) {
  return resource === "regions" || resource === "modules" ? { id } : { id };
}

const withRegion = new Set([
  "highlights",
  "events",
  "meetings",
  "documents",
  "directory",
  "gallery",
  "organogram",
  "keyFigures",
]);
router.get("/admin/:resource", requireAuth, async (req, res, next) => {
  try {
    const config = configs[req.params.resource];
    if (!config)
      return res.status(404).json({ error: "Unknown content section" });
    const rows =
      req.params.resource === "regions"
        ? await config.model.findMany({
            include: { pipelines: true },
            orderBy: { name: "asc" },
          })
        : req.params.resource === "pipelines"
          ? await config.model.findMany({
              include: { region: true },
              orderBy: { name: "asc" },
            })
          : await config.model.findMany({
              ...(withRegion.has(req.params.resource)
                ? { include: { region: true } }
                : {}),
              orderBy: { createdAt: "desc" },
            });
    res.json(rows);
  } catch (error) {
    next(error);
  }
});
router.post("/admin/:resource", requireAuth, async (req, res, next) => {
  try {
    const config = configs[req.params.resource];
    if (!config)
      return res.status(404).json({ error: "Unknown content section" });
    for (const field of config.required)
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      )
        return res.status(400).json({ error: `${field} is required` });
    const resource = req.params.resource;
    const body = { ...req.body };
    if (body.regionId === ALL_REGIONS) {
      if (nullableRegion.has(resource)) {
        body.regionId = null;
      } else if (fanOut.has(resource)) {
        const regions = await prisma.region.findMany({ select: { id: true } });
        if (!regions.length)
          return res.status(400).json({ error: "No regions exist yet." });
        const rows = await prisma.$transaction(
          regions.map((region) => {
            const data = payloadFor(config, {
              ...body,
              regionId: region.id,
              ...(resource === "pipelines" ? {} : { pipelineId: null }),
            });
            return createRecord(resource, config, data);
          }),
        );
        return res.status(201).json({ count: rows.length, rows });
      } else {
        return res
          .status(400)
          .json({ error: "This section does not support All Regions." });
      }
    }
    const row = await createRecord(resource, config, payloadFor(config, body));
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
});
router.put("/admin/:resource/:id", requireAuth, async (req, res, next) => {
  try {
    const resource = req.params.resource;
    const config = configs[resource];
    if (!config)
      return res.status(404).json({ error: "Unknown content section" });
    const body = { ...req.body };
    if (body.regionId === ALL_REGIONS) {
      if (nullableRegion.has(resource)) body.regionId = null;
      else
        return res
          .status(400)
          .json({
            error:
              "Choose one specific region when editing. To add the same record to every region, add it as a new record with All Regions selected.",
          });
    }
    for (const field of config.required)
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      )
        return res.status(400).json({ error: `${field} is required` });
    const row = await config.model.update({
      where: recordWhere(resource, req.params.id),
      data: payloadFor(config, body),
    });
    res.json(row);
  } catch (error) {
    next(error);
  }
});
router.delete("/admin/:resource/:id", requireAuth, async (req, res, next) => {
  try {
    const config = configs[req.params.resource];
    if (!config)
      return res.status(404).json({ error: "Unknown content section" });
    await config.model.delete({
      where: recordWhere(req.params.resource, req.params.id),
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
