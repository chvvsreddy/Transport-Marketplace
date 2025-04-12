"use client";

import Link from "next/link";
import { useState } from "react";
import "../../(styles)/RegisterPage.css";
import Header from "@/app/util/Header";
import { createUser } from "@/state/api";
import { useRouter } from "next/navigation";

const features = [
  {
    name: "Push to deploy.",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
  },
  {
    name: "SSL certificates.",
    description:
      "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.",
  },
  {
    name: "Database backups.",
    description:
      "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
  },
];

const UserType = {
  SHIPPER_COMPANY: "Shipper Company",
  INDIVIDUAL_SHIPPER: "Individual Shipper",
  LOGISTICS_COMPANY: "Logistics Company",
  INDIVIDUAL_DRIVER: "Individual Driver",
  ADMIN: "Admin",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    passwordHash: "",
    phone: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createUser(formData);

      if (res.id) {
        router.push("/login");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="overflow-hidden bg-white">
            <div className="mx-auto grid lg:grid-cols-3 gap-x-0 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none  min-h-dvh">
              <div className="login-left py-12 px-12 lg:col-span-2">
                <div className="relative z-30">
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                    A better Transit
                  </p>
                  <p className="mt-6 text-lg/8 text-white">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Maiores impedit perferendis suscipit eaque, iste dolor
                    cupiditate blanditiis ratione.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-white lg:max-w-none">
                    {features.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="flex justify-center">
                  <Link href={"/"}>
                    <img
                      src="/goodseva-logo.png"
                      alt="Goodseva-logo"
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>

                <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                  Create new account
                </h2>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Password
                        </label>
                      </div>
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

                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="mobile"
                          className="block text-sm/6 font-medium text-gray-900 pt-6"
                        >
                          Mobile No
                        </label>
                      </div>
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

                      <div className="flex items-center justify-between">
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
