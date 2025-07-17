import getTokenIdFromLs from "@/app/util/getTokenIdFromLS";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface UpdateUserProfileInput {
  userId: string;
  email?: string;
  phone?: string;
  profilePic?: string; // Should be the image URL if uploading to S3 first
}

export interface allLoads {
  id: string;
  shipper: string;
  shipperId: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: string;
  cargoType: string;
  specialRequirements: string;
  //status              LoadStatus @default(AVAILABLE)
  price: number;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  isBulkLoad: boolean;
  isFragile: boolean;
  requiresColdStorage: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface allUsers {
  id: string;
  email: string;
  passwordHash: string;
  type: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AllLoads {
  allLoads: allLoads[];
}
export interface AllUsers {
  allLoads: allUsers[];
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, {}) => {
      const token = getTokenIdFromLs();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["AllLoads", "AllUsers"],
  endpoints: (build) => ({
    getAllLoads: build.query<AllLoads, void>({
      query: () => "/allLoads",
      providesTags: ["AllLoads"],
    }),
    getAllUsers: build.query<AllUsers, void>({
      query: () => "/allUsers",
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
  const token = getTokenIdFromLs();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile?userId=${obj}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("user getting error:", error);
  }
};

export const createBid = async ({
  loadId,
  userId,
  price,
  negotiateDriverPrice,
}: {
  loadId: string;
  userId: string;
  price: number;
  negotiateDriverPrice: number;
}) => {
  const token = getTokenIdFromLs();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ loadId, userId, price, negotiateDriverPrice }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create bid");
  }

  return res.json();
};

export const getAllUsers = async () => {
  const token = getTokenIdFromLs();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allUsers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("users getting error:", error);
  }
};

export const getLoads = async () => {
  const token = getTokenIdFromLs();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allLoads`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("loads getting error:", error);
  }
};

export const getBids = async () => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("bids getting error:", error);
  }
};
export const updateBid = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error on updating bid", error);
  }
};
export const updateBidStatus = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error on updating bid", error);
  }
};
export const getLoadsById = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allLoads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("loads getting By id, got error:", error);
  }
};

export const getBidsByLoadId = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trips`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("bids getting By id, got error:", error);
  }
};
export const getTripsByLoadId = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trips`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("trips getting By id, got error:", error);
  }
};

export const getTripByLoadId = async (loadId: string) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trips/${loadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const trip = await response.json();
    return trip;
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const createLoad = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const getLatLngFromGoogleAPI = async (location: any) => {
      const fullAddress = `${location.address}, ${location.city}, ${location.state}, ${location.postalCode}, ${location.country}`;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data?.results?.length > 0 && data.results[0].geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.warn("No geolocation results for:", location);
        return { lat: "", lng: "" };
      }
    };

    const { lat: originLat, lng: originLng } = await getLatLngFromGoogleAPI(
      obj.origin
    );
    obj.origin = {
      ...obj.origin,
      lat: originLat,
      lng: originLng,
    };

    const { lat: destLat, lng: destLng } = await getLatLngFromGoogleAPI(
      obj.destination
    );
    obj.destination = {
      ...obj.destination,
      lat: destLat,
      lng: destLng,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/postload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(obj),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Creating load error:", error);
    throw error;
  }
};

export const getLoadByLoadId = async (loadId: any) => {
  const token = getTokenIdFromLs();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/myLoads/${loadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("load getting By LoadId, got error:", error);
  }
};

export const getActiveBidsByCarrierId = async (carrierId: string) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carrierId }),
      }
    );
    return response.json();
  } catch (e) {
    console.error(" got error in filter active bids by carrierId:", e);
  }
};

export const getDataForTripsAssigning = async (carrierId: string) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation/${carrierId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  } catch (e) {
    console.error(" got error in filter active trips for assigning", e);
  }
};
export const getLoadByLoadIdForAdmin = async (loadId: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/myLoads/${loadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("load getting By LoadId for admin, got error:", error);
  }
};

export const getLoadBidPaymentTripByUserId = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const getUserCompanyDetails = async (userId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/Register/companyDetails/${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  } catch (e) {
    console.error(" got error getting user for comapny details", e);
  }
};
export const getActiveVehiclesByOwnerId = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const fetchTrucksById = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
export const updateVehicleStatus = async (obj: any) => {
  const token = getTokenIdFromLs();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/vehicleStatus`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
export const createTrip = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/createTrip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
export const createCompanyDetailsToUser = async (obj: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/Register/companyDetails`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
export const getNotificationsByUserId = async (userId: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const upadteNotifs = async (obj: any) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (input: UpdateUserProfileInput) => {
  try {
    const token = getTokenIdFromLs();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data;
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    throw error;
  }
};
export const { useGetAllLoadsQuery } = api;
