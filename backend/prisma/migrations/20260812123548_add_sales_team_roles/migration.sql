-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SALES_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'TEAM_LEADER';
ALTER TYPE "UserRole" ADD VALUE 'SALES_EXECUTIVE';

-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "role" SET DEFAULT 'SALES_EXECUTIVE';
