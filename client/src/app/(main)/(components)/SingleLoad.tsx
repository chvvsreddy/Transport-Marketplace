"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import Heading from "@/app/util/Heading";
import { getStatusColor } from "@/app/util/statusColorLoads";
import {
  getBidsByLoadId,
  getLoadByLoadId,
  getLoadByLoadIdForAdmin,
  getUser,
} from "@/state/api";

import { ArrowDownCircle, Edit } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, Upload } from "antd";
import Shimmer from "./shimmerUi/Shimmer";
import MapComponent from "./MapComponent";
const props: UploadProps = {
  action: "//jsonplaceholder.typicode.com/posts/",
  listType: "picture",
  previewFile(file) {
    console.log("Your upload file:", file);
    // Your process logic. Here we just mock to the same file
    return fetch("https://next.json-generator.com/api/json/get/4ytyBoLK8", {
      method: "POST",
      body: file,
    })
      .then((res) => res.json())
      .then(({ thumbnail }) => thumbnail);
  },
};
interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  price: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  updatedAt: string;
  negotiateShipperPrice: number;
  negotiateDriverPrice: number;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
}
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
interface SampleUser {
  id: string;
  email: string;
  type: string;
}

export default function SingleLoad() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const loadId = params.loadId as string;

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [findBidActive, setBidActive] = useState<Bid | undefined>();
  const [findUserForThisLoad, setUserActive] = useState<
    SampleUser | undefined
  >();

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
      let bids = await getBidsByLoadId({
        loadId,
      });
      setBids(bids);

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

  useEffect(() => {
    async function fetchData() {
      if (bids.length > 0) {
        const activeBid: any = bids.find((b: any) => b.status === "ACCEPTED");
        const user = await getUser(activeBid?.carrierId);
        setUserActive(user);
        setBidActive(activeBid);
      }
    }
    fetchData();
  }, [bids]);

  console.log(findBidActive);
  if (loading)
    return (
      <div className="p-6 text-gray-500">
        <Shimmer />
      </div>
    );
  if (!load)
    return (
      <div className="p-6 text-red-600 font-semibold">Load not found.</div>
    );

  return (
    <>
      <div className="flex justify-between items-center pr-4">
        <Heading name="Load Details" />

        {pathname.includes("/myloads") && (
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => router.push(`/myloads/${loadId}/edit`)}
            style={findBidActive && { display: "none" }}
          >
            <Edit className="inline mr-1" /> Edit
          </button>
        )}
      </div>
      <div className="main-content !p-0">
        <div className="grid grid-cols-4">
          {/* Left column */}
          <div className="p-6 border-neutral-200 border-r-2 col-span-4 md:col-span-1 flex flex-col gap-4">
            <div className="text-sm text-gray-500">
              <p>Created at: {new Date(load.createdAt).toLocaleString()}</p>
              <p>Updated at: {new Date(load.updatedAt).toLocaleString()}</p>
            </div>
            <p>
              <span className="labelStyle">Status</span>
              <br />
              <span className={`${getStatusColor(load.status)}`}>
                {load.status}
              </span>
            </p>
            <p>
              <span className="labelStyle">Load ID</span>
              <br />
              <span className="valueStyle">{load.id}</span>
            </p>
            <p>
              <span className="labelStyle">Load Price</span>
              <br />
              <span className="valueStyle">
                ₹
                {findBidActive
                  ? findBidActive.negotiateDriverPrice
                  : load.price}
              </span>
            </p>
            <p>
              <span className="labelStyle">Cargo Type</span>
              <br />
              <span className="valueStyle">{load.cargoType}</span>
            </p>
            <p>
              <span className="labelStyle">Weight</span>
              <br />
              <span className="valueStyle">{load.weight} Tones</span>
            </p>
            <p>
              <span className="labelStyle">Dimensions</span>
              <br />
              <span className="valueStyle">
                {load.dimensions.length}m x {load.dimensions.width}m x{" "}
                {load.dimensions.height}m
              </span>
            </p>
            <p>
              <span className="labelStyle">Special Requirements</span>
              <br />
              <span className="valueStyle">
                {load.specialRequirements?.join(", ") || "None"}
              </span>
            </p>
            <p>
              <span className="labelStyle">Fragile</span>
              <br />
              <span className="valueStyle">
                {load.isFragile ? "Yes" : "No"}
              </span>
            </p>
            <p>
              <span className="labelStyle">Cold Storage</span>
              <br />
              <span className="valueStyle">
                {load.requiresColdStorage ? "Yes" : "No"}
              </span>
            </p>
            <p>
              <span className="labelStyle">Bulk Load</span>
              <br />
              <span className="valueStyle">
                {load.isBulkLoad ? "Yes" : "No"}
              </span>
            </p>
          </div>

          <div className="col-span-4 md:col-span-3">
            <div className="box mx-4">
              <p
                onClick={() => toggleSection("route")}
                className="accordian-header"
              >
                Origin - Destination
                <ArrowDownCircle
                  className={`transition-transform duration-200 ${
                    openSections.route ? "rotate-180" : ""
                  }`}
                />
              </p>
              {openSections.route && (
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="labelStyle">Origin</p>
                    <p>{load.origin.address}</p>
                    <p>
                      {load.origin.city}, {load.origin.state}
                    </p>
                    <p>
                      {load.origin.country} - {load.origin.postalCode}
                    </p>
                    <div className="mt-3">
                      <p className="labelStyle">Pickup Window</p>
                      <p>
                        {new Date(load.pickupWindowStart).toLocaleString()} -{" "}
                        {new Date(load.pickupWindowEnd).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="labelStyle">Destination</p>
                    <p>{load.destination.address}</p>
                    <p>
                      {load.destination.city}, {load.destination.state}
                    </p>
                    <p>
                      {load.destination.country} - {load.destination.postalCode}
                    </p>
                    <div className="mt-3">
                      <p className="labelStyle">Delivery Window</p>
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
            <div className="box mx-4">
              <p
                onClick={() => toggleSection("bid")}
                className="accordian-header"
              >
                Bid
                <ArrowDownCircle
                  className={`transition-transform duration-200 ${
                    openSections.bid ? "rotate-180" : ""
                  }`}
                />
              </p>
              {/* <div className="bg-red-100 p-2 text-black rounded-md mb-2">
                Till now now one responded for the bid
              </div>
              <div className="bg-orange-100 p-2 text-black rounded-md mb-2">
                2 Drivers Responded. Bid Going on...
              </div>
              <div className="bg-green-100 p-2 text-black rounded-md mb-2">
                Bid completed. Mohan has confirmed for this load.
              </div> */}
              {openSections.bid && (
                <div className="pt-4 text-gray-500">
                  {bids.length === 0 && (
                    <div className="bg-red-100 p-2 text-black rounded-md mb-2">
                      Till now, no one has responded for the bid.
                    </div>
                  )}

                  {bids.length > 0 && load.status === "AVAILABLE" && (
                    <div className="bg-orange-100 p-2 text-black rounded-md mb-2">
                      {bids.length} Driver{bids.length > 1 ? "s" : ""}{" "}
                      Responded. Bid negotiation is ongoing...
                    </div>
                  )}

                  {bids.length > 0 &&
                    load.status === "ASSIGNED" &&
                    findBidActive && (
                      <div className="bg-green-100 p-2 text-black rounded-md mb-2">
                        Bid completed.
                        {findBidActive != undefined &&
                          findUserForThisLoad?.email}{" "}
                        has confirmed for this load.
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Documents Section */}
            {/* <div>
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
          </div> */}

            {/* Trip Section */}
            <div className="box mx-4 mb-4">
              <p
                onClick={() => toggleSection("trip")}
                className="accordian-header"
              >
                Trip
                <ArrowDownCircle
                  className={`transition-transform duration-200 ${
                    openSections.trip ? "rotate-180" : ""
                  }`}
                />
              </p>
              {openSections.trip && (
                <div className="pt-4 text-gray-500">
                  <div className="p-3 border-2 rounded-md border-neutral-200 mb-2">
                    <h6 className="mb-2"> Pre-Trip Documents</h6>
                    <Upload {...props}>
                      {" "}
                      <Button icon={<UploadOutlined />}>Upload</Button>{" "}
                    </Upload>
                  </div>
                  <div className="p-3 border-2 rounded-md border-neutral-200 mb-2 map-bg">
                    <MapComponent
                      origin={{ lat: load.origin.lat, lng: load.origin.lng }}
                      destination={{
                        lat: load.destination.lat,
                        lng: load.destination.lng,
                      }}
                    />
                  </div>
                  <div className="p-3 border-2 rounded-md border-neutral-200">
                    <h6 className="mb-2"> Post-Trip Documents</h6>
                    <Upload {...props}>
                      {" "}
                      <Button icon={<UploadOutlined />}>Upload</Button>{" "}
                    </Upload>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
