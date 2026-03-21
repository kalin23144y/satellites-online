/*
  Warnings:

  - You are about to drop the column `country` on the `Satellite` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Satellite_country_idx";

-- AlterTable
ALTER TABLE "Satellite" DROP COLUMN "country",
ADD COLUMN     "countryId" UUID;

-- CreateTable
CREATE TABLE "Country" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Satellite_countryId_idx" ON "Satellite"("countryId");

-- AddForeignKey
ALTER TABLE "Satellite" ADD CONSTRAINT "Satellite_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
