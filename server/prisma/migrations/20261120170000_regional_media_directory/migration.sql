-- Regional directory workbook and media attachments
ALTER TABLE "Region" ADD COLUMN "directoryFileUrl" TEXT;

ALTER TABLE "Event" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "OrganogramNode"
  ADD COLUMN "fileUrl" TEXT,
  ADD COLUMN "fileName" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "fileSize" INTEGER;

-- Normalize the public labels while preserving the existing region IDs and relations.
UPDATE "Region" SET "name" = 'Jaipur' WHERE lower("id") = 'jaipur' OR lower("name") = 'jaipur';
UPDATE "Region" SET "name" = 'Jamnagar' WHERE lower("id") = 'jamnagar' OR lower("name") = 'jamnagar';
