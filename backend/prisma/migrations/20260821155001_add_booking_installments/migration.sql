-- CreateTable
CREATE TABLE "booking_installment_stages" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "stageName" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_installment_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_installment_payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" TEXT,
    "referenceNo" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_installment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_installment_stages_bookingId_idx" ON "booking_installment_stages"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_installment_stages_bookingId_sequence_key" ON "booking_installment_stages"("bookingId", "sequence");

-- CreateIndex
CREATE INDEX "booking_installment_payments_bookingId_idx" ON "booking_installment_payments"("bookingId");

-- CreateIndex
CREATE INDEX "booking_installment_payments_installmentId_idx" ON "booking_installment_payments"("installmentId");

-- CreateIndex
CREATE INDEX "booking_installment_payments_paymentDate_idx" ON "booking_installment_payments"("paymentDate");

-- AddForeignKey
ALTER TABLE "booking_installment_stages" ADD CONSTRAINT "booking_installment_stages_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_installment_payments" ADD CONSTRAINT "booking_installment_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_installment_payments" ADD CONSTRAINT "booking_installment_payments_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "booking_installment_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
