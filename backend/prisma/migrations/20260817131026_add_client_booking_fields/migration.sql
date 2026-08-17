-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "afterDiscountAmount" DOUBLE PRECISION,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "chequeNo" TEXT,
ADD COLUMN     "customerNeed" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "finance" TEXT,
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "doa" TIMESTAMP(3),
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "profile" TEXT;
