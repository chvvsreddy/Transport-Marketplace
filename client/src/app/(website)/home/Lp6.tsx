import Image from "next/image";
import worker from "../../../../public/happiness.png";

export default function Lp6() {
  return (
    <div>
      <div className="main-layout">
        <div className="mx-auto grid lg:grid-cols-5 gap-16 py-10 lg:py-20">
          <div className="lg:pt-4 pt-0 col-span-3 lg:col-span-2">
            <Image src={worker} alt="Happy person" className="rounded-3xl" />
            <div className="flex flex-col justify-center p-5 rounded-2xl my-4">
              <p className="text-2xl mb-4">Contact Our Expert</p>
              <p className="text-xl text-neutral-500">
                Reach Out to Our Professionals for Moving Advice
              </p>
            </div>
          </div>
          <div className="lg:pt-4 lg:pr-8 col-span-3 lg:col-span-3">
            <h2 className="text-3xl  tracking-tight text-balance text-gray-900 sm:text-5xl">
              The <span id="offeringTxt">Step-by-Step</span> Guide to Your
              Seamless Loads
            </h2>
            <div className="mt-8 max-w-12/12 lg:max-w-10/12">
              <p className="text-neutral-500">
                <span className="text-xl text-black">
                  Initial Consultation and Assessment -
                </span>
                Lorem morbi et amet suscipit. At sed proin quis risus urna a.
                Magna in odio in urna amet ultrices fermentum. Mauris in pretium
                eget.
              </p>
              <hr className="my-5" />
            </div>
            <div className="mt-8 max-w-12/12 lg:max-w-10/12">
              <p className="text-neutral-500">
                <span  className="text-xl text-black">
                  Customized Moving Plan -
                </span>
                Lorem morbi et amet suscipit. At sed proin quis risus urna a.
                Magna in odio in urna amet ultrices fermentum. Mauris in pretium
                eget.
              </p>
              <hr className="my-5" />
            </div>
            <div className="mt-8 max-w-12/12 lg:max-w-10/12">
              <p className="text-neutral-500">
                <span  className="text-xl text-black">
                  Packing and Transportation -
                </span>
                Lorem morbi et amet suscipit. At sed proin quis risus urna a.
                Magna in odio in urna amet ultrices fermentum. Mauris in pretium
                eget.
              </p>
              <hr className="my-5" />
            </div>
            <div className="mt-8 max-w-12/12 lg:max-w-10/12">
              <p className="text-neutral-500">
                <span  className="text-xl text-black">
                  Delivery and Unpacking -
                </span>
                Lorem morbi et amet suscipit. At sed proin quis risus urna a.
                Magna in odio in urna amet ultrices fermentum. Mauris in pretium
                eget.
              </p>
              <hr className="my-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
