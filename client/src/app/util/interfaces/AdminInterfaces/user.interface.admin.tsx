export interface User {
  id: string;
  email: string;
  passwordHash: string;
  type: UserType;
  phone: string;
  profilePic?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;

  // Relationships
  companyDetails?: CompanyDetails;
  individualShipperDetails?: IndividualShipperDetails;
  driverDetails?: DriverDetails;

  // Removed: bids, trips, orders, notifications
  // You can still re-add them later if needed.
}
export enum UserType {
  SHIPPER_COMPANY = "SHIPPER_COMPANY",
  INDIVIDUAL_SHIPPER = "INDIVIDUAL_SHIPPER",
  LOGISTICS_COMPANY = "LOGISTICS_COMPANY",
  INDIVIDUAL_DRIVER = "INDIVIDUAL_DRIVER",
  ADMIN = "ADMIN",
}

export interface DriverDetails {
  id: string;
  userId: string;
  user: User;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseFrontUrl: string;
  licenseBackUrl?: string;
  insuranceNumber: string;
  insuranceExpiry: Date;
  insuranceDocUrl: string;

  yearsOfExperience?: number;
  preferredRoutes: string[];
  hasOwnVehicle: boolean;
  currentLocation?: {
    address: string;
    lat: number;
    lng: number;
  };

  emergencyContactName: string;
  emergencyContactPhone: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualShipperDetails {
  id: string;
  userId: string;
  user: User;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  aadhaarNumber?: string;
  panNumber?: string;
  aadhaarUrl?: string;
  panUrl?: string;

  isBusiness: boolean;
  businessName?: string;
  businessGST?: string;

  createdAt: Date;
  updatedAt: Date;
}
export interface CompanyDetails {
  id: string;
  userId: string;
  user: User;
  companyName: string;
  legalName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website?: string;

  // Indian IDs
  cin?: string;
  gstNumber?: string;
  panNumber?: string;
  tinNumber?: string;

  fleetSize?: number;
  operatingSince?: Date;

  createdAt: Date;
  updatedAt: Date;
}
export interface VehicleType {
  acOption: string;
  size: string;
  type: string;
  trollyOption: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  vehicleType: VehicleType; // Can be improved to an enum or specific structure if known

  isActive: boolean;

  // Ownership
  ownerId: string;
  owner: User;

  // Driver details
  driverName: string;
  driverImage?: string;
  contact1: string;
  contact2?: string;
  currentLocation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  driverLicense: string;
  driverRC: string;
  driverPAN: string;

  // Additional vehicle details
  insuranceNumber: string;
  insuranceExpiry: Date;
  fitnessCertExpiry: Date;
  permitType?: string;

  isVehicleVerified: boolean;
  isDriverVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}
