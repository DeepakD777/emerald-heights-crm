-- CreateEnum
CREATE TYPE "NocStatus" AS ENUM ('PENDING', 'IN_PROCESS', 'APPROVED', 'REJECTED', 'ISSUED');

-- CreateTable
CREATE TABLE "nocs" (
    "id" TEXT NOT NULL,
    "nocCode" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" "NocStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nocs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nocs_nocCode_key" ON "nocs"("nocCode");

-- CreateIndex
CREATE INDEX "nocs_bookingId_idx" ON "nocs"("bookingId");

-- AddForeignKey
ALTER TABLE "nocs" ADD CONSTRAINT "nocs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
