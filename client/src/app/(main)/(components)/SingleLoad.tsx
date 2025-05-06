"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { SocketContext } from "@/app/util/SocketContext";
import {  getLoadByLoadId, getLoadByLoadIdForAdmin } from "@/state/api";
import {ArrowDownCircle, Edit} from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

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
}

export default function SingleLoad() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const loadId = params.loadId as string;

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { socket } = useContext(SocketContext) || {};
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
          ><Edit/>  Edit
          </button>
        )}
        {pathname.includes("/loadmanagement") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/loadmanagement/${loadId}/edit`)} > <Edit/> Edit
          </button>
        )}
      </div>

      {/* Status and Price */}
      <div className="grid grid-cols-4 gap-8">
        <div className="grid gap-4 grid-rows p-6 border-neutral-200 border-2 rounded-md">
          <p> Status:<br/><span className="font-semibold"> {load.status} </span> </p>
          <p> Load ID:<br/><span className="font-semibold">{load.id}</span>  </p>
          <p>Your Price:<br/><span className="font-semibold"> ₹{load.price} </span></p>

          {/* Cargo Type & Requirements */}
          <p>Cargo Type:<br/><span className="font-semibold">{load.cargoType}</span></p>
          <p>Weight:<br/><span className="font-semibold"> {load.weight} Tones</span>
              </p>
         <p>Dimensions:<br/><span className="font-semibold">
                {load.dimensions.length}m x {load.dimensions.width}m x{" "}
                {load.dimensions.height}m</span>
              </p>
          <p>Special Requirements:<br/><span className="font-semibold">
            
            {load.specialRequirements?.join(", ") || "None"}</span>
          </p>
          <p>Fragile:<br/><span className="font-semibold">
          {load.isFragile ? "Yes" : "No"}</span>
        </p>
        <p>Cold Storage:<br/><span className="font-semibold">
          {load.requiresColdStorage ? "Yes" : "No"}</span>
        </p>
        <p>Bulk Load:<br/><span className="font-semibold">
          {load.isBulkLoad ? "Yes" : "No"}</span>
        </p>
        
        </div>
        <div className="col-span-3 border-neutral-200 border-2 rounded-md">
          <p className="text-md font-semibold p-3 border-b-2 border-neutral-200 flex justify-between">Orgin - Destination <ArrowDownCircle/> </p>
            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-4 p-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Origin</h3>
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
                    {new Date(load.pickupWindowStart).toLocaleString()} - 
                    {new Date(load.pickupWindowEnd).toLocaleString()}
                  </p>
                </div>
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
                <div className="mt-3">
                  <h4 className="font-semibold">Delivery Window</h4>
                  <p>
                    {new Date(load.deliveryWindowStart).toLocaleString()} - 
                    {new Date(load.deliveryWindowEnd).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          <hr className="mt-5"/>
          <p className="text-md font-semibold p-3 border-b-2 border-neutral-200 flex justify-between text-neutral-300">Bid <ArrowDownCircle/> </p>
          <hr className="mt-5"/>
          <p className="text-md font-semibold p-3 border-b-2 border-neutral-200 flex justify-between text-neutral-300">Documents<ArrowDownCircle/> </p> 
          <hr className="mt-5"/>
          <p className="text-md font-semibold p-3 border-b-2 border-neutral-200 flex justify-between text-neutral-300">Trip <ArrowDownCircle/> </p>
          <hr className="mt-5"/>
          <p className="text-md font-semibold p-3 border-b-2 border-neutral-200 flex justify-between text-neutral-300">Documents<ArrowDownCircle/> </p>
  
        </div>
       
      
       
      </div>

     

      

      <div className="grid grid-cols-3 gap-4">
        
      </div>

      <div className="grid grid-cols-2 gap-4">
        
       
      </div>

      <div className="text-sm text-gray-500">
        <p>Created at: {new Date(load.createdAt).toLocaleString()}</p>
        <p>Updated at: {new Date(load.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
