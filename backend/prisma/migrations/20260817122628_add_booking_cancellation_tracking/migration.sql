-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
