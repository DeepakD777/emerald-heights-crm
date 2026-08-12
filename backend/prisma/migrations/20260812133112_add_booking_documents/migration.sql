-- CreateEnum
CREATE TYPE "BookingDocumentType" AS ENUM ('REQUISITION_LETTER', 'AGREEMENT_TO_SELL', 'TRIPARTITE_AGREEMENT');

-- CreateEnum
CREATE TYPE "BookingDocumentStatus" AS ENUM ('PENDING', 'GENERATED', 'UPLOADED', 'GIVEN', 'COMPLETED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "aadhar" TEXT,
ADD COLUMN     "pan" TEXT;

-- CreateTable
CREATE TABLE "booking_documents" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "BookingDocumentType" NOT NULL,
    "status" "BookingDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "givenAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_documents_bookingId_idx" ON "booking_documents"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_documents_bookingId_type_key" ON "booking_documents"("bookingId", "type");

-- AddForeignKey
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
