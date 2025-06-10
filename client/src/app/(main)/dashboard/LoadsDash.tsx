import React from "react";

type Load = {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  status: string;
  price: number;
  pickupWindow: string;
};

const mockLoads: Load[] = [
  {
    id: "L-001",
    origin: "Mumbai",
    destination: "Delhi",
    cargoType: "Electronics",
    status: "AVAILABLE",
    price: 12000,
    pickupWindow: "6 Jun - 7 Jun",
  },
  {
    id: "L-002",
    origin: "Bangalore",
    destination: "Hyderabad",
    cargoType: "Furniture",
    status: "IN_TRANSIT",
    price: 8500,
    pickupWindow: "6 Jun - 8 Jun",
  },
  {
    id: "L-003",
    origin: "Chennai",
    destination: "Pune",
    cargoType: "Perishables",
    status: "DELIVERED",
    price: 15000,
    pickupWindow: "2 Jun - 4 Jun",
  },
];

const LoadTable = () => {
  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Loads</h2>
      <table className="min-w-full table-auto text-sm text-left text-gray-500">
        <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-2">Load ID</th>
            <th className="px-4 py-2">Origin</th>
            <th className="px-4 py-2">Destination</th>
            <th className="px-4 py-2">Cargo</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Price (₹)</th>
            <th className="px-4 py-2">Pickup Window</th>
          </tr>
        </thead>
        <tbody>
          {mockLoads.map((load) => (
            <tr
              key={load.id}
              className="border-b hover:bg-gray-50 transition duration-200"
            >
              <td className="px-4 py-2">{load.id}</td>
              <td className="px-4 py-2">{load.origin}</td>
              <td className="px-4 py-2">{load.destination}</td>
              <td className="px-4 py-2">{load.cargoType}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    load.status === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : load.status === "IN_TRANSIT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {load.status}
                </span>
              </td>
              <td className="px-4 py-2 font-medium">
                ₹{load.price.toLocaleString()}
              </td>
              <td className="px-4 py-2">{load.pickupWindow}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadTable;
