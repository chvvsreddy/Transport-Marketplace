-- AlterTable
ALTER TABLE "DriverDetails" ADD COLUMN     "currentLocation" JSONB;

-- AlterTable
ALTER TABLE "Loads" ADD COLUMN     "noOfTrucks" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "profilePic" TEXT;
