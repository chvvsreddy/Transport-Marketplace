type LoadStatus =
  | "AVAILABLE"
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

interface Location {
  city: string;
  state: string;
  postalCode: string;
}

interface Load {
  id: string;
  origin: Location;
  destination: Location;
  specialRequirements: string;
  cargoType: string;
  trucks: number;
  pickupWindowStart: string;
  deliveryWindowEnd: string;
  status: LoadStatus;
  createdAt: string;
}
