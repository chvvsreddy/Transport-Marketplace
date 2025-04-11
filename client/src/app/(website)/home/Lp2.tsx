"use client";
import Image from "next/image";


import happy from "../../../../public/happyness.png";
import { Star } from "lucide-react";


export default function Lp2() {
  return (
    <div className="main-layout">
      <div className="mx-auto grid lg:grid-cols-5 gap-8 py-10 lg:py-20">
      <div className="lg:pt-4 lg:pr-8 col-span-3 lg:col-span-3">
         <h2  className="text-3xl  tracking-tight text-balance text-gray-900 sm:text-5xl"> Why We&apos;re Your Top Choice for Loads Transport</h2>
          <div className="mt-8">
            <h3 className="text-2xl"> Experienced Professionals
            </h3>
            <p className="text-neutral-500" >
            Lorem morbi et amet suscipit. At sed proin quis risus urna a.
            Magna in odio in urna amet ultrices fermentum. Mauris in
            pretium eget donec erat ipsum a leo. Maecenas elementum
            consectetur ac blandit tortor.
            </p>
            <hr className="my-5"/>
          </div>
          <div>
            <h3 className="text-2xl">Tailored Solutions
            </h3>
            <p className="text-neutral-500" >
            Lorem morbi et amet suscipit. At sed proin quis risus urna a.
            Magna in odio in urna amet ultrices fermentum. Mauris in
            pretium eget donec erat ipsum a leo. Maecenas elementum
            consectetur ac blandit tortor.
            </p>
            <hr className="my-5"/>
          </div>
          <div>
            <h3 className="">Efficiency and Timeliness
              </h3>
            <p className="text-neutral-500" >
            Lorem morbi et amet suscipit. At sed proin quis risus urna a.
            Magna in odio in urna amet ultrices fermentum. Mauris in
            pretium eget donec erat ipsum a leo. Maecenas elementum
            consectetur ac blandit tortor.
            </p>
            <hr className="my-5"/>
          </div>
      </div>
      <div className="lg:pt-4 pt-0 col-span-3 lg:col-span-2">
        <Image src={happy} alt="Happy person" className="rounded-3xl" />
        <div className="flex flex-col justify-center bg-black p-5 rounded-2xl my-4">
          <div className="flex mb-2">
          <Star className="fill-amber-300"/><Star className="fill-amber-300"/><Star className="fill-amber-300"/><Star className="fill-amber-300"/><Star className="fill-amber-300"/>
          </div>
          <p className="text-white">
            4.8/5 Ratings From customers
          </p>
          <p className="text-neutral-500">
            Lorem morbi et amet suscipit
          </p>
        </div>
      </div>
      
      </div>
  
    </div>
  );
}
