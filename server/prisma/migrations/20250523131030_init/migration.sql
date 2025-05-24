/*
  Warnings:

  - A unique constraint covering the columns `[loadId]` on the table `Trips` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Trips_loadId_key" ON "Trips"("loadId");

-- AddForeignKey
ALTER TABLE "Trips" ADD CONSTRAINT "Trips_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
