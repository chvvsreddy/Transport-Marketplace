"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { getLoadByLoadId, getLoadByLoadIdForAdmin } from "@/state/api";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SingleLoad() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const loadId = params.loadId as string;

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userObj = getLoggedUserFromLS();
    if (userObj && userObj !== "no user found") {
      setLoggedUser(userObj);
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchLoad = async () => {
      if (loggedUser?.userId && loadId) {
        let fetchedLoad;
        if (pathname.includes("/myloads")) {
          fetchedLoad = await getLoadByLoadId(loadId);
          if (!fetchedLoad || fetchedLoad.shipperId !== loggedUser.userId) {
            router.push("/login");
            return;
          }
        } else if (pathname.includes("/loadmanagement")) {
          fetchedLoad = await getLoadByLoadIdForAdmin(loadId);
        }

        setLoad(fetchedLoad || null);
        setLoading(false);
      }
    };
    fetchLoad();
  }, [loggedUser?.userId, loadId, pathname]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!load) {
    return (
      <div className="p-6 text-red-600 font-semibold">Load not found.</div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Load Details</h2>
        {pathname.includes("/myloads") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/myloads/${loadId}/edit`)}
          >
            ✏️ Edit
          </button>
        )}
        {pathname.includes("/loadmanagement") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/loadmanagement/${loadId}/edit`)}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Status and Price */}
      <div className="grid grid-cols-2 gap-4">
        <p>
          <span className="font-semibold">Status:</span> {load.status}
        </p>
        <p>
          <span className="font-semibold">Price:</span> ₹
          {load.price.toLocaleString()}
        </p>
      </div>

      {/* Origin & Destination */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Origin</h3>
          <p>{load.origin.address}</p>
          <p>
            {load.origin.city}, {load.origin.state}
          </p>
          <p>
            {load.origin.country} - {load.origin.postalCode}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Destination</h3>
          <p>{load.destination.address}</p>
          <p>
            {load.destination.city}, {load.destination.state}
          </p>
          <p>
            {load.destination.country} - {load.destination.postalCode}
          </p>
        </div>
      </div>

      {/* Weight & Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <p>
          <span className="font-semibold">Weight:</span> {load.weight} kg
        </p>
        <p>
          <span className="font-semibold">Dimensions:</span>{" "}
          {load.dimensions.length}m x {load.dimensions.width}m x{" "}
          {load.dimensions.height}m
        </p>
      </div>

      {/* Cargo Type & Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <p>
          <span className="font-semibold">Cargo Type:</span> {load.cargoType}
        </p>
        <p>
          <span className="font-semibold">Special Requirements:</span>{" "}
          {load.specialRequirements?.join(", ") || "None"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <p>
          <span className="font-semibold">Fragile:</span>{" "}
          {load.isFragile ? "Yes" : "No"}
        </p>
        <p>
          <span className="font-semibold">Cold Storage:</span>{" "}
          {load.requiresColdStorage ? "Yes" : "No"}
        </p>
        <p>
          <span className="font-semibold">Bulk Load:</span>{" "}
          {load.isBulkLoad ? "Yes" : "No"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Pickup Window</h4>
          <p>
            {new Date(load.pickupWindowStart).toLocaleString()} -<br />
            {new Date(load.pickupWindowEnd).toLocaleString()}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Delivery Window</h4>
          <p>
            {new Date(load.deliveryWindowStart).toLocaleString()} -<br />
            {new Date(load.deliveryWindowEnd).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Created at: {new Date(load.createdAt).toLocaleString()}</p>
        <p>Updated at: {new Date(load.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
