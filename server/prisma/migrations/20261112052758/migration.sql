/*
  Warnings:

  - You are about to drop the column `uploadedBy` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_regionId_fkey";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "uploadedBy";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrganogramNode" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";
