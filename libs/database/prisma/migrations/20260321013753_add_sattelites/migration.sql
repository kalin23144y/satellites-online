-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "File" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Satellite" (
    "id" TEXT NOT NULL,
    "noradId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "operator" TEXT,
    "country" TEXT,
    "purpose" TEXT,
    "groupName" TEXT,
    "orbitClass" TEXT,
    "inclination" DOUBLE PRECISION,
    "periodMin" DOUBLE PRECISION,
    "altitudeKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileId" UUID,

    CONSTRAINT "Satellite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TleRecord" (
    "id" TEXT NOT NULL,
    "satelliteId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL,
    "epoch" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TleRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Satellite_noradId_key" ON "Satellite"("noradId");

-- CreateIndex
CREATE INDEX "Satellite_country_idx" ON "Satellite"("country");

-- CreateIndex
CREATE INDEX "Satellite_purpose_idx" ON "Satellite"("purpose");

-- CreateIndex
CREATE INDEX "Satellite_orbitClass_idx" ON "Satellite"("orbitClass");

-- CreateIndex
CREATE INDEX "TleRecord_satelliteId_idx" ON "TleRecord"("satelliteId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Satellite" ADD CONSTRAINT "Satellite_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TleRecord" ADD CONSTRAINT "TleRecord_satelliteId_fkey" FOREIGN KEY ("satelliteId") REFERENCES "Satellite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
