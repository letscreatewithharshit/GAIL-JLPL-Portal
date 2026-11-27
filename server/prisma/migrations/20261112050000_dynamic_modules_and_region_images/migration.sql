ALTER TABLE "Region" ADD COLUMN "image" TEXT;

CREATE TABLE "PortalModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleHi" TEXT,
    "description" TEXT,
    "descriptionHi" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'FileText',
    "availableRegions" TEXT[] NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortalModule_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Event" ADD COLUMN "imageUrl" TEXT;

CREATE TABLE "PortalSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "heroTitle" TEXT,
    "heroTitleHi" TEXT,
    "heroSubtitle" TEXT,
    "heroSubtitleHi" TEXT,
    "heroImage" TEXT,
    "announcement" TEXT,
    "announcementHi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortalSetting_pkey" PRIMARY KEY ("id")
);

-- Align existing starter tables with the current Prisma models.
ALTER TABLE "Department"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Event"
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "OrganogramNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHi" TEXT,
    "designation" TEXT,
    "designationHi" TEXT,
    "parentId" TEXT,
    "regionId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganogramNode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrganogramNode_parentId_sortOrder_idx" ON "OrganogramNode"("parentId", "sortOrder");
ALTER TABLE "OrganogramNode" ADD CONSTRAINT "OrganogramNode_regionId_fkey"
    FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
