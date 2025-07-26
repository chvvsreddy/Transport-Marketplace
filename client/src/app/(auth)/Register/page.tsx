"use client";

import Link from "next/link";
import { useState } from "react";
import "../../(styles)/RegisterPage.css";

import {
  createUser,
  getIndividualDriverDetails,
  getIndividualShipperDetails,
  getSingleVehicleBtOwnerId,
  getUserCompanyDetails,
} from "@/state/api";
import { useRouter } from "next/navigation";
import { Image, message, Radio, Spin } from "antd";

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
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const router = useRouter();

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (pwd: string) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return pattern.test(pwd);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      passwordHash: value,
    }));

    setValidation({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setLoadingSpin(true);
    e.preventDefault();
    setLoading(true);
    setError("");

    const userTypeKey = userType1 + userType2;
    const type = UserType[userTypeKey as keyof typeof UserType];

    const dataToSubmit = {
      ...formData,
      type,
    };
    if (!validatePassword(dataToSubmit.passwordHash)) {
      message.error("password should meet requirements");
      setLoading(false);
      setLoadingSpin(false);
      return;
    }

    try {
      const res = await createUser(dataToSubmit);
      let data;
      let driverVehicleData;
      if (res.id) {
        if (
          res.id &&
          (res.type === "LOGISTICS_COMPANY" || res.type === "SHIPPER_COMPANY")
        ) {
          data = await getUserCompanyDetails(res.id);

          if (data === null) {
            return router.push(`/Register/${res.type}?userId=${res.id}`);
          }
        } else if (res.id && res.type === "INDIVIDUAL_SHIPPER") {
          data = await getIndividualShipperDetails(res.id);
          if (data == null) {
            return router.push(`/Register/individualShipperDetails/${res.id}`);
          }
        } else if (res.id && res.type === "INDIVIDUAL_DRIVER") {
          data = await getIndividualDriverDetails(res.userId);
          driverVehicleData = await getSingleVehicleBtOwnerId(res.id);

          if (data == null || driverVehicleData == null) {
            return router.push(`/Register/driver/${res.id}`);
          }
        }
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
      setLoadingSpin(false);
    }
  };

  return (
    <Spin spinning={loadingSpin}>
      <div className="overflow-hidden bg-white">
        <div className="mx-auto grid lg:grid-cols-3 gap-x-0 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none min-h-dvh">
          <div className="login-left flex-1 flex-col justify-center py-12 px-12 lg:col-span-2 hidden lg:flex">
            <div className="relative z-30">
              <p className="mt-2 text-2xl font-semibold text-white lg:text-5xl text-center lg:text-right">
                A better Transit
              </p>
              <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:-translate-x-full lg:-translate-y-1/2">
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-44 w-64 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                      <Image
                        alt=""
                        src="Lorry.jpg"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="h-64 w-64 overflow-hidden rounded-lg">
                      <Image
                        alt=""
                        src="happyness.png"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-64 overflow-hidden rounded-lg">
                      <Image
                        alt=""
                        src="happy.jpg"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt=""
                        src="happiness.png"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="h-44 w-64 overflow-hidden rounded-lg">
                      <Image
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

          {/* Right Panel */}
          <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="flex justify-center">
              <Link href={"/"}>
                <Image
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">
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
                      <Radio.Button value="Individual">Individual</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Mobile No
                  </label>
                  <input
                    id="mobile"
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="passwordHash"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={formData.passwordHash}
                    onChange={handlePasswordChange}
                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                  />
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li
                      className={
                        validation.minLength ? "text-green-600" : "text-red-600"
                      }
                    >
                      {validation.minLength ? "✔" : "✖"} Minimum 8 characters
                    </li>
                    <li
                      className={
                        validation.uppercase ? "text-green-600" : "text-red-600"
                      }
                    >
                      {validation.uppercase ? "✔" : "✖"} At least one uppercase
                      letter
                    </li>
                    <li
                      className={
                        validation.lowercase ? "text-green-600" : "text-red-600"
                      }
                    >
                      {validation.lowercase ? "✔" : "✖"} At least one lowercase
                      letter
                    </li>
                    <li
                      className={
                        validation.number ? "text-green-600" : "text-red-600"
                      }
                    >
                      {validation.number ? "✔" : "✖"} At least one number
                    </li>
                    <li
                      className={
                        validation.specialChar
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {validation.specialChar ? "✔" : "✖"} At least one special
                      character
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center button-primary mt-6"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>

                {error && (
                  <div className="text-center text-red-500 mt-4">{error}</div>
                )}
              </form>

              <p className="mt-10 text-center text-sm text-gray-500">
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
    </Spin>
  );
}
