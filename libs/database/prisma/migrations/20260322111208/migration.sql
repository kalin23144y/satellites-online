-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('inProgress', 'failed', 'parsed');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'inProgress';
