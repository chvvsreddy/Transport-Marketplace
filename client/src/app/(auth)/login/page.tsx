"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkUser } from "@/state/api";
import { useRouter } from "next/navigation";



export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);
  const onsubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await checkUser({
        email,
        password,
      });

      if (res.userId) {
        localStorage.setItem("token", JSON.stringify(res));
        if (res.type == "SHIPPER_COMPANY") {
          router.push("/shipper/dashboard");
        } else if (res.type == "INDIVIDUAL_SHIPPER") {
          router.push("/individualShipper/dashboard");
        } else if (res.type == "LOGISTICS_COMPANY") {
          router.push("/logistics/dashboard");
        } else if (res.type == "INDIVIDUAL_DRIVER") {
          router.push("/driver/dashboard");
        } else if (res.type == "ADMIN") {
          router.push("/admin/dashboard");
        }
      } else {
        setError("Invalid credentials, please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="overflow-hidden bg-white">

          <div className="mx-auto grid lg:grid-cols-3 gap-x-0 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none min-h-dvh">
          <div className="login-left flex-1 flex-col justify-center py-12 px-12 lg:col-span-2  hidden lg:flex">
              <div className="relative z-30">
              <p className="mt-2 text-2xl font-semibold text-white lg:text-5xl text-center lg:text-right">
                  A better Transit
                </p>
                <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:-translate-x-full lg:-translate-y-1/2">
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-44 w-64 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                        <img alt=""
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
                  />
                </Link>
              </div>

              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>

              <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form
                  action="#"
                  method="POST"
                  className="space-y-6"
                  onSubmit={onsubmit}
                >
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      <div className="text-sm">
                        <a
                          href="#"
                          className="font-semibold text-orange-800 hover:text-orange-900"
                        >
                          Forgot password?
                        </a>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex w-full justify-center button-primary mt-6"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign in"}{" "}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="text-center text-red-500 mt-4">{error}</div>
                )}

                <p className="mt-10 text-center text-sm/6 text-gray-500">
                  Not a member?{" "}
                  <Link
                    href="/Register"
                    className="font-semibold text-orange-800 hover:text-orange-900"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>

      </div>

    </div>
  );
}
