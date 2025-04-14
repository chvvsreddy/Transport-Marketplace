"use client"
import Heading from '@/app/(components)/Heading'
import { useGetAllLoadsQuery } from '@/state/api'
import React,{useState} from 'react'

interface Location {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address?: string;
  country?: string;
  postalCode?: string;
}
interface Load {
  id: string; // or number, whatever your ID is
  origin: Location;
  shipperId: string;  
  status : String; 
  // Add other properties you expect on a load
  destination:Location;
  // ...etc
}
const Loads = () => {
  const { data,isLoading,isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = allLoads || [];
  
  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !allData) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch Loads
      </div>
    );
  }

  return (
    <>
    <Heading name='Loads' />
    
 <ul role="list" className="divide-y divide-gray-100">
      {allData.map((load) => (
        <li key={load.id} className="flex justify-between gap-x-6 py-5">
          <div className="flex min-w-0 gap-x-4">
            {/* <img alt="" src={person.imageUrl} className="size-12 flex-none rounded-full bg-gray-50" /> */}
            <div className="min-w-0 flex-auto">
              <p className="text-sm/6 font-semibold text-gray-900">{load.origin.city}</p>
              <p className="mt-1 truncate text-xs/5 text-gray-500">{load.origin.city}</p>
            </div>
            <div className="min-w-0 flex-auto">
              <p className="text-sm/6 font-semibold text-gray-900">{load.destination.city}</p>
              <p className="mt-1 truncate text-xs/5 text-gray-500">{load.origin.city}</p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm/6 text-gray-900">{load.status}</p>
           
          </div>
        </li>
      ))}
    </ul>
    </>
  )
}

export default Loads