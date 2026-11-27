-- Banner video support (homepage settings + per-region)
ALTER TABLE "PortalSetting" ADD COLUMN "heroVideo" TEXT;
ALTER TABLE "Region" ADD COLUMN "video" TEXT;

-- Key Figures (8 boxes per region, slot 1..8)
CREATE TABLE "KeyFigure" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "labelHi" TEXT,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyFigure_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KeyFigure_regionId_slot_key" ON "KeyFigure"("regionId", "slot");

ALTER TABLE "KeyFigure" ADD CONSTRAINT "KeyFigure_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
