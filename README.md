# GAIL Regional Operations & Maintenance Portal

React + Node.js/Express + PostgreSQL application for local development followed by an approved GAIL Intranet deployment. The public website supports English and Hindi. Editable portal content is stored in PostgreSQL and read through REST APIs; the React source no longer contains a separate static business-content catalogue.

> This is a development implementation, not an approved GAIL production system. The GAIL wordmark is a text placeholder and sample region images are illustrative. Replace them with GAIL-approved brand assets and content. Do not use real employee/contact data or operational documents until GAIL approves the environment and access policy.

## Main features

- English/Hindi language switch. Admin content fields include English and Hindi values; Hindi falls back to English when the Hindi field is empty.
- React/Vite public site, Node.js/Express REST API, PostgreSQL and Prisma.
- One environment-configured Admin login. No employee registration, multi-role system or user-management screens.
- Admin CRUD for Highlights, Events, Meetings, Documents, Telephone Directory, Gallery, Departments, Organogram, Regions, Pipelines, O&M Modules and Homepage Settings.
- Monthly Calendar uses published Events and Meetings; there is no second calendar-entry list to maintain.
- Draft/Published/Archived workflow for publishable content. Draft and Archived items do not appear in public feeds.
- Local development uploads under `server/uploads` (15 MB limit). Production storage must be approved by GAIL IT.
- Protected write APIs, password hashing, JWT session, login rate limit, Helmet and request limits.

## Windows local setup

### Requirements

Install Node.js LTS, PostgreSQL and VS Code. Verify in PowerShell:

```powershell
node -v
npm -v
```

### Create the database

In pgAdmin create a database named `gail_regional_portal`.

### Configure the backend

Copy `server/.env.example` to `server/.env`, then update the PostgreSQL password and set a unique admin password (at least 12 characters) and random JWT secret (at least 32 characters). Example:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/gail_regional_portal?schema=public"
JWT_SECRET="use-a-random-secret-at-least-32-characters-long"
CLIENT_ORIGIN="http://localhost:5173"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-unique-password-at-least-12-characters"
```

Never share or commit `server/.env`. The ZIP intentionally does not contain `.env` or `node_modules`.

### Install and migrate

From the project root in PowerShell:

```powershell
npm install
npm run install:all
cd server
npx prisma generate
npx prisma migrate dev
npm run db:seed
cd ..
```

Migrations preserve the existing portal content tables, add Hindi fields, settings/modules and remove the unused multi-user/role tables. Back up an existing database before applying migrations. Do not delete the database to fix a migration error.

### Start the site

```powershell
npm run dev
```

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin
- API health: http://localhost:5000/api/health

The Admin login uses `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `server/.env`.

## Admin workflow

1. Sign in at `/admin`.
2. Select a section.
3. Enter English and Hindi text in their respective fields. If Hindi is left empty, English is shown as fallback.
4. Select Draft or Published where the section has a publication status.
5. Upload documents/photos or select an image for Events, Regions and Homepage Settings.
6. Save. After save, the Admin page refreshes the portal API data. Public pages read the saved database record.
7. For the Calendar, add/publish an Event or Meeting. It automatically appears on its date.

Website Settings has one record with ID `main`; edit that record to change homepage heading, description, banner and announcement. Region IDs and Module IDs should remain stable after they are used in links/records.

## REST API overview

Public read endpoints:

- `GET /api/health`
- `GET /api/portal` (homepage feed: settings, regions, departments, modules, highlights, events, meetings, documents, directory, gallery, organogram)
- `GET /api/regions`, `GET /api/pipelines`, `GET /api/modules`
- `GET /api/highlights`, `GET /api/events`, `GET /api/meetings`
- `GET /api/calendar?from=ISO_DATE&to=ISO_DATE&regionId=central`
- `GET /api/documents?regionId=central&category=Audits`
- `GET /api/directory?regionId=central&q=search-term`

Admin endpoints require `Authorization: Bearer <token>`:

- `POST /api/auth/login`
- `POST /api/uploads`
- `GET /api/admin/:resource`
- `POST /api/admin/:resource`
- `PUT /api/admin/:resource/:id`
- `DELETE /api/admin/:resource/:id`

Resources: `highlights`, `events`, `meetings`, `documents`, `directory`, `gallery`, `departments`, `organogram`, `regions`, `pipelines`, `modules`, `settings`. All writes are authenticated.

## Data ownership and publishing

- Website content is stored in PostgreSQL; the API is the only source used by public React pages for editable content.
- Region/pipeline/module starter records are inserted by the seed script and can subsequently be managed from Admin. Re-running seed updates the agreed starter records; do not edit those IDs casually.
- Events and Meetings feed the Calendar automatically.
- Employee directory and gallery/organogram records are visible when saved; verify GAIL approval before adding real personal information.

## Uploads and intranet deployment

Local uploads are in `server/uploads`; back them up separately from PostgreSQL. Before GAIL Intranet deployment, GAIL IT must approve hosting, database, TLS, network access, admin authentication policy, file storage, malware scanning, backup/retention and monitoring. Move uploads to approved enterprise storage if required. Set production secrets outside the source tree and use HTTPS. Do not expose Vite development server or an unprotected write API.

The same application can serve `client/dist` from Express after `npm run build --prefix client`. For Intranet, confirm with GAIL IT whether standalone Node/PostgreSQL hosting is approved or whether an SPFx/SharePoint Lists architecture is required.

## Backup

```powershell
pg_dump -U postgres -h localhost -d gail_regional_portal -F c -f gail_portal_backup.dump
```

Back up `server/uploads` separately. Test restore into a separate database before relying on backups.

## Project structure

```text
gail-regional-portal/
  client/                 React/Vite public website and Admin UI
  server/                 Express REST API and Prisma schema/migrations
    prisma/               schema, migrations and seed data
    src/routes/           auth and portal APIs
    uploads/              local development uploads
  docs/                   admin handover and deployment notes
```

## Known pre-deployment tasks

- Replace text logo and illustrative stock imagery with approved GAIL assets.
- Confirm official regional content, pipeline mapping, department labels and module applicability.
- Confirm which directory data, documents and photos may be visible to the Intranet audience.
- Run Windows install, Prisma migration, full browser CRUD testing, accessibility/security testing and GAIL IT review before production.

## Update: regions, key figures, banner video, documents (Nov 2026)

**Existing database – run once, in this order** (from the project root, back up first):

```powershell
cd server
npx prisma generate
npx prisma migrate dev          # adds KeyFigure table + banner video columns
npm run db:rename-regions       # central/eastern/western/northern -> Samakhali/Nasirabad/AbuRoad/Mansarampura
cd ..
npm run dev
```

Fresh database: `npx prisma migrate dev` then `npm run db:seed` already creates the 4 regions.

- **Region filter** – choose a region in the header "Select Region" menu or the pills on the homepage. Homepage, Key Figures, Documents, Meetings, Calendar, Directory, Gallery and Organogram then show only that region (records saved as *All Regions* appear everywhere).
- **Banner** – Admin > Website Settings: upload a *banner video* (MP4/WebM) and/or *banner image*. The video plays when present, otherwise the image is shown. A region can also have its own banner video (Admin > Regions).
- **Today's date** – always shown on the homepage banner and updates at midnight.
- **Key Figures** (`/key-figures`) – 8 boxes per region. Fill them in Admin > Key Figures (pick Box 1-8, value, unit, region).
- **Admin region tabs** – on every section that has a Region field there is an **All / Samakhali / Nasirabad / AbuRoad / Mansarampura** bar. A region tab preselects that region and lists only its records. In the form, *All Regions* adds the record to every region (one copy per region; highlights/events/organogram are stored once and shown in all regions).
- **Documents** – users see 4 tabs: IQMS, Audits, Pipeline Integrity, Statutory Documents. Admin chooses the type from a dropdown. Old documents with a different category text must be edited to one of these 4 types to appear.
- Uploads now allow MP4/WebM video, limit raised to 100 MB.


## JLPL dashboard updates

The portal homepage now includes:
- A month calendar with published Events and Meetings from the database.
- A large Jamnagar–Loni pipeline route-map image extracted from the supplied one-page PDF. Select **View full map** to open the original-resolution web image.
- Four visual document collections: IQMS, Audits, Pipeline Integrity and Statutory Documents. Selecting a collection filters its published documents.
- Eight database-backed Key Figures. The seed script upserts the supplied Jamnagar–Loni figures for each configured region, so existing values are refreshed when the seed is run.

### Apply the database figures

From the project folder, run:

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

If your database is managed through migrations instead of `db push`, apply the existing migrations first, then run `npm run db:seed`.

### Replace the route map

Replace `client/src/images/jlpl-route-map.webp` with the replacement map image, keeping the same filename, or update the import in `client/src/components/EventsRouteMap.jsx`.

### Update Key Figures later

Sign in to `/admin`, open **Key Figures**, choose the region and slot, and update the value/unit. The public dashboard reads the saved records from the database.

### Build the frontend

```bash
cd client
npm install
npm run build
```

The shared project archive intentionally excludes `node_modules` and `server/.env`. Reinstall dependencies and configure your own environment file before running the server.


## Regional UI and data updates (20 Nov 2026)
- Public header selector contains Jaipur and Jamnagar only; Jaipur is the first-visit default.
- The homepage still lists all six ED regions separately.
- Organogram has an independent six-region filter, defaulting to Jaipur.
- Admin region scope retains All Regions plus the individual six regions.
- Growth and Projects is a static, reference-based chart section. It includes capacity growth, exit points, and the approved expansion card only; no Completed or Network cards are shown.
- Telephone Directory is region-scoped, searchable, and downloadable as an Excel workbook.
- Admin can import an `.xlsx` or `.csv` directory file for one selected region. The import replaces that region's existing directory entries.
- Events support a cover photo plus multiple additional photos, shown on the event detail page.
- Organogram nodes support PDF/JPG/PNG/WebP attachments with browser preview and download.
- A Prisma migration adds the event photo array, Organogram attachment metadata, and region directory workbook URL.

## Apply the new backend dependencies and migration
From `server/`:
```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```
Copy `.env.example` to `.env` and set your real database URL, JWT secret, and admin credentials. Do not commit or share `.env`.

## Directory Excel format
Use a first worksheet with a header row. Required header: `Name` (or `Employee Name`). Optional headers: `Name Hindi`, `Designation`, `Designation Hindi`, `Department`, `Pipeline`, `Phone`/`Mobile`, `Email`. Department and pipeline names are linked to matching records already present in that region.


## Existing uploaded media
The uploaded source archive contained an empty `server/uploads/` directory. The original banner MP4 and any previously uploaded admin documents/photos were not present in the archive. To retain them, copy the original project's actual `server/uploads` contents into this project's `server/uploads` folder before running it. Existing database URLs alone cannot restore missing media files.
