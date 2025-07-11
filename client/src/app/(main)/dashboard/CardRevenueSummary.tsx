import React from "react";

const CardRevenueSummary = () => {
  return (
    <div className="md:row-span-1 xl:row-span-2 bg-white col-span-1 xl:col-span-2 rounded-sm border-neutral-200 border-1 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2 px-5 pt-4">
        <h2 className="font-semibold text-lg text-gray-700">Revenue</h2>
      </div>
      <h2 className="font-semibold text-lg text-gray-700"></h2>
      <hr />
    </div>
  );
};

export default CardRevenueSummary;
