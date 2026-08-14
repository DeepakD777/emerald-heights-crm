-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "phase" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "tower" TEXT;

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_type_phase_idx" ON "properties"("type", "phase");

-- CreateIndex
CREATE INDEX "properties_type_phase_tower_idx" ON "properties"("type", "phase", "tower");

-- CreateIndex
CREATE INDEX "properties_type_phase_tower_floor_idx" ON "properties"("type", "phase", "tower", "floor");

-- CreateIndex
CREATE INDEX "properties_unitNumber_idx" ON "properties"("unitNumber");
