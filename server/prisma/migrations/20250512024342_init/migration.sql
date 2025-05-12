-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "isDriverAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShipperAccepted" BOOLEAN NOT NULL DEFAULT false;
