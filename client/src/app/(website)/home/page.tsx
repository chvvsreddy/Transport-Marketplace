"use client";

import Header from "@/app/util/Header";
import Link from "next/link";
import Lp2 from "./Lp2";
import Lp3 from "./Lp3";
import Lp4 from "./Lp4";
import Lp5 from "./Lp5";
import Lp6 from "./Lp6";
import Footer from "@/app/util/Footer";


const Home = () => {
  return (
    <div>
      <div className="bg-white">
        <Header />

        <div className=" main-layout">
          <div className="relative px-6 pt-14 lg:px-8  home-banner rounded-3xl overflow-hidden">
            <div className="mx-auto max-w-2xl py-32 lg:py-24">
              <div className="text-center relative z-50">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
                  Digital Transport @ it's BEST
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-white sm:text-xl/8">
                  Improve your logistics with our quick, seamless, and
                  economical dispatch service. Beyond Expectations.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/" className="button-white">
                    Get started
                  </Link>
                  <a href="#" className="text-sm/6 font-semibold text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Lp2/>
        <Lp3/>
        <Lp4/>
        <Lp5/>
        <Lp6/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;
