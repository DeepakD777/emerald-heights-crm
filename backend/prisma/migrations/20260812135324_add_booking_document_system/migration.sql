/*
  Warnings:

  - The `status` column on the `booking_documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `booking_documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('REQUISITION_LETTER', 'AGREEMENT_TO_SELL', 'TRIPARTITE_AGREEMENT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'GENERATED', 'UPLOADED', 'GIVEN', 'COMPLETED');

-- AlterTable
ALTER TABLE "booking_documents" DROP COLUMN "type",
ADD COLUMN     "type" "DocumentType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "BookingDocumentStatus";

-- DropEnum
DROP TYPE "BookingDocumentType";

-- CreateIndex
CREATE UNIQUE INDEX "booking_documents_bookingId_type_key" ON "booking_documents"("bookingId", "type");
