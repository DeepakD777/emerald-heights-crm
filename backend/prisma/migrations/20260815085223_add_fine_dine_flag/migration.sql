-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "isFineDine" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "properties_isFineDine_idx" ON "properties"("isFineDine");
