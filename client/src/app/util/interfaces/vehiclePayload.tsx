export interface VehiclePayload {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  vehicleType: any; // Can be made more specific if you know the structure (e.g., enum or object)
  insuranceNumber: string;
  insuranceExpiry: string; // Format: "YYYY-MM-DD"
  fitnessCertExpiry: string; // Format: "YYYY-MM-DD"
  permitType?: string | null;
  ownerId: string;

  driverName: string;
  contact1: string;
  contact2?: string | null;
  driverImage?: string; // URL
  driverLicense: string; // URL
  driverRC: string; // URL
  driverPAN: string; // URL
}
