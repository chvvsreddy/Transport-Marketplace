"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import Heading from "@/app/util/Heading";
import { getStatusColor } from "@/app/util/statusColorLoads";
import { getLoadByLoadId, getLoadByLoadIdForAdmin } from "@/state/api";
import { ArrowDownCircle, Edit } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Location {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
interface Load {
  id: string;
  origin: Location;
  destination: Location;
  shipperId: string;
  status: string;
  cargoType: string;
  weight: number;
  bidPrice: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  dimensions: { length: number; width: number; height: number };
  specialRequirements?: string[];
  isFragile: boolean;
  requiresColdStorage: boolean;
  isBulkLoad: boolean;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
}

export default function SingleLoad() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const loadId = params.loadId as string;

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    route: true,
    bid: false,
    documents: false,
    trip: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
          if (!fetchedLoad) {
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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!load)
    return (
      <div className="p-6 text-red-600 font-semibold">Load not found.</div>
    );

  return (
    <>
      <div className="flex justify-between items-center pr-4">
        <Heading name="Load Details"/>

        {pathname.includes("/myloads") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/myloads/${loadId}/edit`)}
          >
            <Edit className="inline mr-1" /> Edit
          </button>
        )}
        {pathname.includes("/loadmanagement") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/loadmanagement/${loadId}/edit`)}
          >
            <Edit className="inline mr-1" /> Edit
          </button>
        )}
      </div>
      <div className={`bg-white m-4 rounded-xl shadow-md mt-4`}>
      <div className="grid grid-cols-4">
        {/* Left column */}
        <div className="grid gap-4 p-6 border-neutral-200 border-r-2 col-span-4 md:col-span-1">
          <div className="text-sm text-gray-500">
            <p>Created at: {new Date(load.createdAt).toLocaleString()}</p>
            <p>Updated at: {new Date(load.updatedAt).toLocaleString()}</p>
          </div>
          <p>
            Status:
            <br />
            <span className={`font-semibold ${getStatusColor(load.status)}`}>
              {load.status}
            </span>
          </p>
          <p>
            Load ID:
            <br />
            <span className="font-semibold">{load.id}</span>
          </p>
          <p>
            Your Price:
            <br />
            <span className="font-semibold">₹{load.price}</span>
          </p>
          <p>
            Cargo Type:
            <br />
            <span className="font-semibold">{load.cargoType}</span>
          </p>
          <p>
            Weight:
            <br />
            <span className="font-semibold">{load.weight} Tones</span>
          </p>
          <p>
            Dimensions:
            <br />
            <span className="font-semibold">
              {load.dimensions.length}m x {load.dimensions.width}m x{" "}
              {load.dimensions.height}m
            </span>
          </p>
          <p>
            Special Requirements:
            <br />
            <span className="font-semibold">
              {load.specialRequirements?.join(", ") || "None"}
            </span>
          </p>
          <p>
            Fragile:
            <br />
            <span className="font-semibold">
              {load.isFragile ? "Yes" : "No"}
            </span>
          </p>
          <p>
            Cold Storage:
            <br />
            <span className="font-semibold">
              {load.requiresColdStorage ? "Yes" : "No"}
            </span>
          </p>
          <p>
            Bulk Load:
            <br />
            <span className="font-semibold">
              {load.isBulkLoad ? "Yes" : "No"}
            </span>
          </p>
        </div>

        <div className="col-span-4 md:col-span-3">
          <div>
            <p onClick={() => toggleSection("route")} className="accordian-header" >
              Origin - Destination
              <ArrowDownCircle
                className={`transition-transform duration-200 ${
                  openSections.route ? "rotate-180" : ""
                }`}
              />
            </p>
            {openSections.route && (
              <div className="grid md:grid-cols-2 gap-4 p-6">
                <div>
                  <h3 className="font-semibold mb-1">Origin</h3>
                  <p>{load.origin.address}</p>
                  <p>
                    {load.origin.city}, {load.origin.state}
                  </p>
                  <p>
                    {load.origin.country} - {load.origin.postalCode}
                  </p>
                  <div className="mt-3">
                    <h4 className="font-semibold">Pickup Window</h4>
                    <p>
                      {new Date(load.pickupWindowStart).toLocaleString()} -{" "}
                      {new Date(load.pickupWindowEnd).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Destination</h3>
                  <p>{load.destination.address}</p>
                  <p>
                    {load.destination.city}, {load.destination.state}
                  </p>
                  <p>
                    {load.destination.country} - {load.destination.postalCode}
                  </p>
                  <div className="mt-3">
                    <h4 className="font-semibold">Delivery Window</h4>
                    <p>
                      {new Date(load.deliveryWindowStart).toLocaleString()} -{" "}
                      {new Date(load.deliveryWindowEnd).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bid Section */}
          <div>
            <p onClick={() => toggleSection("bid")} className="accordian-header" >
              Bid
              <ArrowDownCircle
                className={`transition-transform duration-200 ${
                  openSections.bid ? "rotate-180" : ""
                }`}
              />
            </p>
            {openSections.bid && (
              <div className="p-4 text-gray-500 italic">
                Bid details will go here .
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div>
            <p onClick={() => toggleSection("documents")} className="accordian-header" >
              Documents
              <ArrowDownCircle
                className={`transition-transform duration-200 ${
                  openSections.documents ? "rotate-180" : ""
                }`}
              />
            </p>
            {openSections.documents && (
              <div className="p-4 text-gray-500 italic">
                Document list placeholder.
              </div>
            )}
          </div>

          {/* Trip Section */}
          <div>
            <p onClick={() => toggleSection("trip")} className="accordian-header" >
              Trip
              <ArrowDownCircle
                className={`transition-transform duration-200 ${
                  openSections.trip ? "rotate-180" : ""
                }`}
              />
            </p>
            {openSections.trip && (
              <div className="p-4 text-gray-500 italic">
                Trip details placeholder.
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
