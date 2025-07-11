"use client";

import Link from "next/link";
import { useState } from "react";
import "../../(styles)/RegisterPage.css";

import { createUser } from "@/state/api";
import { useRouter } from "next/navigation";
import { message, Radio } from "antd";

const UserType = {
  ShipperCompany: "SHIPPER_COMPANY",
  ShipperIndividual: "INDIVIDUAL_SHIPPER",
  CarrierCompany: "LOGISTICS_COMPANY",
  CarrierIndividual: "INDIVIDUAL_DRIVER",
};

export default function RegisterPage() {
  const [userType1, setUserType1] = useState("");
  const [userType2, setUserType2] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    passwordHash: "",
    phone: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userTypeKey = userType1 + userType2;
    const type = UserType[userTypeKey as keyof typeof UserType];

    const dataToSubmit = {
      ...formData,
      type,
    };

    console.log("data from user : ", dataToSubmit);

    try {
      const res = await createUser(dataToSubmit);
      if (res.id) {
        message.success("account created successfully");
        router.push(`/Register/${res.type}?userId=${res.id}`);
      } else {
        message.error("Registration failed. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="overflow-hidden bg-white">
          <div className="mx-auto grid lg:grid-cols-3 gap-x-0 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none  min-h-dvh">
            <div className="login-left flex-1 flex-col justify-center py-12 px-12 lg:col-span-2 hidden lg:flex">
              <div className="relative z-30">
                <p className="mt-2 text-2xl font-semibold text-white lg:text-5xl text-center lg:text-right">
                  A better Transit
                </p>
                <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:-translate-x-full lg:-translate-y-1/2">
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-44 w-64 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                        <img
                          alt=""
                          src="Lorry.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-64 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="happyness.png"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-64 w-64 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="happy.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="happiness.png"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-44 w-64 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="lorry1.png"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
              <div className="flex justify-center">
                <Link href={"/"}>
                  <img
                    src="/goodseva-logo.png"
                    alt="Goodseva-logo"
                    className="h-12 w-auto"
                    width="auto"
                    height="auto"
                  />
                </Link>
              </div>
              <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                Create new account
              </h2>

              <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="User Type"
                      className="block text-sm/6 font-medium text-gray-900 mb-2"
                    >
                      User Type
                    </label>
                    <div className="flex gap-3">
                      <Radio.Group
                        value={userType1}
                        onChange={(e) => setUserType1(e.target.value)}
                      >
                        <Radio.Button value="Carrier">Carrier</Radio.Button>
                        <Radio.Button value="Shipper">Shipper</Radio.Button>
                      </Radio.Group>
                      <Radio.Group
                        value={userType2}
                        onChange={(e) => setUserType2(e.target.value)}
                      >
                        <Radio.Button value="Company">Company</Radio.Button>
                        <Radio.Button value="Individual">
                          Individual
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Mobile No{" "}
                    </label>
                    <div className="mt-2">
                      <input
                        id="mobile"
                        name="phone"
                        type="text"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {" "}
                      Password
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="passwordHash"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={formData.passwordHash}
                        onChange={handleChange}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>

                    {/* <div className="flex items-center justify-between">
                    <label
                      htmlFor="userType"
                      className="block text-sm/6 font-medium text-gray-900 pt-6"
                    >
                      Type
                    </label>
                    <div className="mt-2">
                      <select
                        id="userType"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="" disabled>
                          Select a user type
                        </option>
                        {Object.entries(UserType).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div> */}
                    <div className="flex justify-end mt-2">
                      <div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="flex w-full justify-center button-primary mt-6"
                      disabled={loading}
                    >
                      {loading ? "Signing up..." : "Sign up"}{" "}
                      {/* Display loading text */}
                    </button>

                    {error && (
                      <div className="text-center text-red-500 mt-4">
                        {error}
                      </div>
                    )}
                  </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-500">
                  Do you have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-orange-800 hover:text-orange-900"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
