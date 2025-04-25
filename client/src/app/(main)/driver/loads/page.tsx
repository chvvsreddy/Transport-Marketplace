"use client";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import Heading from "@/app/util/Heading/index";
import { useGetAllLoadsQuery } from "@/state/api";
import React, { useEffect, useState } from "react";

interface Location {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  address?: string;
  country?: string;
  postalCode?: string;
}

interface Load {
  id: string;
  origin: Location;
  destination: Location;
  shipperId: string;
  status: string;
}

const Loads = () => {
  const { data, isLoading, isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = allLoads || [];

  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;

          const geoRes = await fetch(
            `${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API}q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API_KEY}`
          );
          const geoData = await geoRes.json();

          const formattedAddress =
            geoData?.results?.[0]?.formatted || "Unknown location";

          const updatedLocation: Location = {
            lat,
            lng,
            address: formattedAddress,
          };

          setLocation(updatedLocation);

          const payload = {
            driverUserId: getLoggedUserFromLS().userId,
            coordinates: updatedLocation,
          };

          const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!backendRes.ok) {
            console.error("Failed to update location on the server.");
          } else {
            console.log("Driver Location updated:", payload);
          }
        } catch (err) {
          console.error("Error during location update:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true } // ✨ added for better accuracy
    );
  }, []);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !allData) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch Loads</div>
    );
  }

  return (
    <>
      <Heading name="Loads" />

      {location && (
        <div className="text-sm text-gray-600 mb-2 px-2">
          <strong>Current Location:</strong> {location.address}
        </div>
      )}

      <ul role="list" className="divide-y divide-gray-100">
        {allData.map((load) => {
          const { origin, destination, status } = load;

          return (
            <li key={load.id} className="flex justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-gray-900">
                    {origin.city}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {origin.state}
                  </p>
                </div>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-gray-900">
                    {destination.city}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {destination.state}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    status === "ACTIVE"
                      ? "text-green-700 bg-green-50 ring-green-600/20"
                      : "text-gray-700 bg-gray-50 ring-gray-600/20"
                  }`}
                >
                  {status}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Loads;
