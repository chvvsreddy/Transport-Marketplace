
import Image from "next/image";
import lorry from "../../../../public/Lorry1.png";


export default function Lp3() {
  return (
    <div style={{backgroundColor:"#000"}}>
      <div className="main-layout">
      <div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-16 py-6 lg:py-20">
        <div className="lg:pt-4 lg:pr-8 col-span-2 lg:col-span-1">
           <div></div>
           <Image src={lorry} alt="lorry" className="Lp2-Left_img" />
        </div>
        <div className="lg:pt-4 lg:pr-8 col-span-2 text-white lg:col-span-1">
          <div>
              <h3 className="text-4xl font-normal">
                <span className="">About Us:</span> Your Reliable
                Goods Moving Partner
              </h3>
              <p className="py-5 max-w-12/12 lg:max-w-9/12">
                Elementum fames et massa molestie. Dolor habitasse id sit cras
                ultricies sit. Morbi sollicitudin quam enim est turpis aliquet.
                Diam in id quis diam. Lacus vestibulum habitant sollicitudin
                egestas. Porttitor enim duis dui in mi.
              </p>
            </div>
           <div className="flex gap-4 my-8 justify-between  max-w-12/12 lg:max-w-9/12">
            <div>
              <p className="lp3-head-text text-5xl text-red-800"> 32+ </p>
              <p className="lp3-head-span"> Years Of Experience </p>
            </div>
            <div>
              <p className="lp3-head-text text-5xl text-red-800">12k</p>
              <p className="lp3-head-span"> Satisfied Clients</p>
            </div>
            <div>
              <p className="lp3-head-text text-5xl text-red-800"> 20+</p>
              <p className="lp3-head-span">  Countries Served</p>
            </div>
           </div>
        </div>
      </div>

      </div>
    </div>
  );
}
