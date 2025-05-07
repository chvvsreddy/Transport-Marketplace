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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

export const getLoads = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allLoads`,
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
    console.error("loads getting error:", error);
  }
};

export const getBids = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bids&orders`,
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
    console.error("bids getting error:", error);
  }
};

export const getLoadsById = async (obj: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/allLoads`,
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
    console.error("loads getting By id, got error:", error);
  }
};

export const createLoad = async (obj: any) => {
  try {
    const getLatLngFromAPI = async (location: any) => {
      const query = `${location.city}+${location.state}+${location.postalCode}`;
      const url = `${
        process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API
      }q=${encodeURIComponent(query)}&key=${
        process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API_KEY
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (data?.results?.length > 0 && data.results[0].geometry) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      } else {
        console.warn("No geolocation results for:", location);
        return { lat: "", lng: "" };
      }
    };

    const { lat: originLat, lng: originLng } = await getLatLngFromAPI(
      obj.origin
    );
    obj.origin = {
      ...obj.origin,
      lat: originLat,
      lng: originLng,
    };

    const { lat: destLat, lng: destLng } = await getLatLngFromAPI(
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
        headers: { "Content-Type": "application/json" },
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
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/myLoads/${loadId}`,
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
    console.error("load getting By LoadId, got error:", error);
  }
};

export const getLoadByLoadIdForAdmin = async (loadId: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/myLoads/${loadId}`,
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
    console.error("load getting By LoadId for admin, got error:", error);
  }
};

// const getDistanceAndTimeBetweenTwoLocations = async (location: any) => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_OPEN_ROUTE_SERVICE_API}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `${process.env.NEXT_PUBLIC_OPEN_ROUTE_SERVICE_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ locations: location }),
//       }
//     );

//     const data = await response.json();

//     const distances = data.distances;
//     const durations = data.durations;

//     const distanceInKm = (distances[0][1] / 1000).toFixed(2);

//     const totalSeconds = durations[0][1];
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);

//     const durationString = `${hours} hours ${minutes} minutes`;

//     return {
//       distanceInKm: Number(distanceInKm),
//       duration: durationString,
//     };
//   } catch (error: any) {
//     console.error("Error fetching matrix:", error.message);
//     return null;
//   }
// };

export const { useGetAllLoadsQuery } = api;
