-- CreateTable
CREATE TABLE "Satcat" (
    "noradCatId" INTEGER NOT NULL,
    "objectName" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "opsStatusCode" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "launchDate" TEXT NOT NULL,
    "launchSite" TEXT NOT NULL,
    "decayDate" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "inclination" INTEGER NOT NULL,
    "apogee" INTEGER NOT NULL,
    "perigee" INTEGER NOT NULL,
    "rcs" DOUBLE PRECISION,
    "dataStatusCode" TEXT NOT NULL,
    "orbitCenter" TEXT NOT NULL,
    "orbitType" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Satcat_noradCatId_key" ON "Satcat"("noradCatId");
