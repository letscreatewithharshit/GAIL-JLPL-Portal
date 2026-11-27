# SharePoint integration decision guide

## Choose the deployment model with GAIL IT first

### Option A — SharePoint-native portal (recommended if the intranet is the required host)

- Build a SharePoint Framework (SPFx) web part using React.
- Use SharePoint Lists for regions, pipelines, meetings, highlights and directory metadata where appropriate.
- Use SharePoint Document Libraries for controlled documents and image assets.
- Use SharePoint permissions / Microsoft Entra ID groups for access control.
- Deploy the approved SPFx package through the organization's app catalog.

This model aligns most directly with an existing SharePoint intranet and avoids duplicating identity and document permissions in a separate app.

### Option B — Separate React + Node application integrated with SharePoint

- Host the React client and Express API only on infrastructure approved by GAIL IT.
- Register an application in the organization's Microsoft Entra ID tenant.
- Agree delegated/application permissions and least-privilege access with the tenant administrators.
- Use Microsoft Graph to access approved SharePoint sites, lists and document libraries.
- Use an approved authentication flow; do not put client secrets in React/browser code.
- Keep tokens and secrets server-side and use secure secret storage.
- Map portal entities to agreed SharePoint list columns and library metadata.

## Questions for GAIL IT

1. Must the portal be hosted within SharePoint, or can it be a separately hosted application linked from the intranet?
2. Is SPFx approved, and which version/toolchain is supported?
3. Which SharePoint site, lists and document libraries should be used?
4. Which Entra ID groups map to Super Admin, Regional Admin, Department Admin and Viewer?
5. What are the retention, classification, audit, backup and file-upload requirements?
6. Is Microsoft Graph access permitted, and which scopes/permissions can be approved?
7. Is there an approved GIS/map source for regional boundaries and pipeline alignments?

## Security note

Do not connect to a live tenant until the GAIL tenant administrator has approved the design, app registration, permissions, data mapping and security review. This starter repository contains no tenant credentials and makes no claim of an active SharePoint connection.
