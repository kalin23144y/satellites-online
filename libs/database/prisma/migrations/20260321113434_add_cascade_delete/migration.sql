-- DropForeignKey
ALTER TABLE "Satellite" DROP CONSTRAINT "Satellite_fileId_fkey";

-- AddForeignKey
ALTER TABLE "Satellite" ADD CONSTRAINT "Satellite_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
