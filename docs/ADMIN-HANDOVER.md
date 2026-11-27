# Admin handover guide / एडमिन उपयोग गाइड

## Login

Open `/admin`. Use the one administrator username and password configured in `server/.env`. No employee accounts, registration or role-management workflow exists. Do not send passwords in the project ZIP or email.

## Content sections

- **Highlights:** headline and details in English/Hindi, category, region and status.
- **Events:** bilingual title/details/venue, date/time, region, optional image and publish status. Published Events appear in the Calendar.
- **Meetings:** bilingual title/venue/agenda, date/time, region/pipeline and minutes link. Published Meetings appear in the Calendar.
- **Calendar:** read-only calendar view generated from published Events and Meetings; do not add the same item twice.
- **Documents:** bilingual title/description, category/module, region/pipeline, file and status.
- **Telephone Directory:** name/designation in both languages, phone/email, region/pipeline/department. Confirm permission before entering personal contact details.
- **Photo Gallery:** bilingual title/caption, region and uploaded image.
- **Departments:** code, English/Hindi name and description.
- **Organogram:** name/designation in both languages, parent node, region and display order.
- **Regions:** stable region ID, bilingual name/description and image.
- **Pipelines:** pipeline/network name and region.
- **O&M Modules:** bilingual title/description, icon, applicable region IDs and visibility.
- **Website Settings:** edit the single `main` record to update homepage headings, banner, description and announcement in both languages.

## Publishing rules

Enter both English and Hindi content. If the Hindi field is empty, the website shows the English value as fallback. Use Draft while preparing material. Publish only after the relevant content owner approves it. Draft and Archived Highlights, Events, Meetings and Documents are hidden from public pages and Calendar.

## File storage and handover

Local development files are saved in `server/uploads`. Back up PostgreSQL and this folder separately. For Intranet deployment, use storage approved by GAIL IT, with retention and malware-scanning rules. Never place `.env`, database passwords or admin credentials inside the ZIP.
