import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface allLoads {
  id: String;
  shipper: String;
  shipperId: String;
  origin: String;
  destination: String;
  weight: number;
  dimensions: String;
  cargoType: String;
  specialRequirements: String;
  //status              LoadStatus @default(AVAILABLE)
  price: number;
  pickupWindowStart: String;
  pickupWindowEnd: String;
  deliveryWindowStart: String;
  deliveryWindowEnd: String;
  isBulkLoad: Boolean;
  isFragile: Boolean;
  requiresColdStorage: Boolean;
  createdAt: String;
  updatedAt: String;
}
export interface allUsers {
  id: String;
  email: String;
  passwordHash: String;
  type: String;
  phone: String;
  isVerified: Boolean;
  createdAt: String;
  updatedAt: String;
}
export interface AllLoads {
  allLoads: allLoads[];
}
export interface AllUsers {
  allLoads: allUsers[];
}
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["AllLoads", "AllUsers"],
  endpoints: (build) => ({
    getAllLoads: build.query<AllLoads, void>({
      query: () => "/allLoads",
      providesTags: ["AllLoads"],
    }),
    getAllUsers: build.query<AllUsers, void>({
      query: () => "allUsers",
      providesTags: ["AllUsers"],
    }),
  }),
});

export interface userDetails {
  email: string;
  password: string;
}

export interface User {
  email: string;
  passwordHash: string;
  phone: string;
  type: string;
}

export const checkUser = async (obj: userDetails) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
  }
};

export const createUser = async (obj: User) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/Register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("creating user error:", error);
  }
};

export const getUser = async (obj: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile?userId=${obj}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("user getting error:", error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allUsers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("users getting error:", error);
  }
};

export const { useGetAllLoadsQuery } = api;
