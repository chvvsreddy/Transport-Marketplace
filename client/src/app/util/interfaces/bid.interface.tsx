export interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  price: number;
  notes?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"; // adjust based on your `BidStatus` enum
  negotiateShipperPrice: number;
  negotiateDriverPrice: number;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
  vehicleId?: string;
  estimatedDuration: number; // in minutes
  isCompanyBid: boolean;
  createdAt: string; // or `Date` depending on how you're handling dates
  updatedAt: string; // or `Date`
}
