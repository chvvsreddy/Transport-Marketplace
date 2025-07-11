import React from "react";

type Load = {
  id: string;
  origin: { city?: string };
  destination: { city?: string };
  cargoType: string;
  status: string;
  price: number;
  pickupWindow: string;
};

interface Props {
  LoadsData: Load[];
}

const LoadTable: React.FC<Props> = ({ LoadsData }) => {
  const hasData = LoadsData && LoadsData.length > 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Loads</h2>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
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
              {LoadsData.map((load) => (
                <tr
                  key={load.id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-2">{load.id}</td>
                  <td className="px-4 py-2">{load.origin.city || "N/A"}</td>
                  <td className="px-4 py-2">
                    {load.destination.city || "N/A"}
                  </td>
                  <td className="px-4 py-2">{load.cargoType}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        load.status === "ASSIGNED" ||
                        load.status === "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : load.status === "IN_TRANSIT"
                          ? "bg-yellow-100 text-yellow-700"
                          : load.status === "DELIVERED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
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
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">No recent loads available.</p>
        </div>
      )}
    </div>
  );
};

export default LoadTable;
