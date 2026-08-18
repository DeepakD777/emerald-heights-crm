-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "financeType" "FinanceType",
ADD COLUMN     "remainingAmount" DOUBLE PRECISION,
ADD COLUMN     "remainingAmountMode" "RemainingAmountMode" NOT NULL DEFAULT 'AUTO';
