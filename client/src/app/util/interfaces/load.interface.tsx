type LoadStatus =
  | "AVAILABLE"
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

interface Location {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  address?: string;
  country?: string;
  postalCode?: string;
}
interface Requirements {
  size: string;
  type: string;
  acOption: string;
  trollyOption: string;
}

export interface Load {
  id: string;
  origin: Location;
  destination: Location;
  shipperId: string;
  status: LoadStatus;
  cargoType: string;
  weight: number;
  bidPrice: number;
  price: number;
  createdAt: string;
  pickupWindowStart: string;
  specialRequirements: Requirements;
  deliveryWindowEnd: string;
}
