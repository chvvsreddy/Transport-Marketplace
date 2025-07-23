import { Image } from "antd";
import { Mail } from "lucide-react";

const features = [
  {
    name: "Local Moving",
    description:
      "Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.",
    img: "offering-icon-1.png",
  },
  {
    name: "Long-Distance Moves",
    description:
      "Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.",
    img: "offering-icon-2.png",
  },
  {
    name: "Specialty Item Moving",
    description:
      "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.",
    img: "offering-icon-3.png",
  },
  {
    name: "Packing and Unpacking",
    description:
      "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.",
    img: "offering-icon-4.png",
  },
  {
    name: "Storage Solutions",
    description:
      "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.",
    img: "offering-icon-5.png",
  },
  {
    name: "Corporate Relocation",
    description:
      "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.",
    img: "offering-icon-6.png",
  },
];

export default function Lp4() {
  return (
    <div className="main-layout">
      <div className="bg-white py-10 sm:py-20">
        <div className="mx-auto lg:px-8">
          <div className="mx-auto flex justify-center items-center flex-col lg:flex-row">
            <p className="mt-2 text-3xl tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
              <span className="text-red-800">Our Offerings</span>: Making Your
              Loads Effortless
            </p>
            <p className="mt-6 text-lg/8 text-gray-600">
              Elementum augue ut sagittis vel nunc. Posuere id velit integer
              proin aliquam facilisi quis et cras. <br />
              <button className="button-primary mt-4 flex gap-2">
                <Mail /> Contact Us
              </button>
            </p>
          </div>
          <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 ">
            <dl className="grid grid-cols-1 gap-10  lg:grid-cols-3 lg:gap-y-10">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="relative bg-neutral-100 p-10 rounded-3xl"
                >
                  <dt className="text-xl text-gray-900 mb-3">
                    <div className=" flex mb-4">
                      <Image alt="" src={feature.img} className="size-12 " />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
