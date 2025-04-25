"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import {
  MailOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Find Loads", href: "/findloads" },
  { name: "Find Trucks", href: "/findtrucks" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setLoggedUser(userObj);
    } else {
      console.log("No user data found in localStorage.");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedUser({ message: "", userId: "" });
    router.push("/");
  };

  return (
    <>
      <header className="inset-x-0 top-0 z-50">
        <div
          style={{ background: "#2A004E", color: "white", padding: "5px 0px" }}
        >
          <div className="main-layout">
            <div className="grid gap-4">
              <div className="text-sm text-neutral-200">
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div className="navbar-icon">
                    <WhatsAppOutlined />
                  </div>
                  <div className="navbar-icon">
                    <VideoCameraOutlined />
                  </div>
                  <div className="navbar-icon">
                    <PhoneOutlined />
                  </div>
                  <h4 className="mobile-number hidden md:block">
                    +91 864 6444 2222
                  </h4>
                  <div className="navbar-mail">
                    <MailOutlined />
                  </div>
                  <span className="hidden md:block">info@goodseva.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="main-layout">
          <nav
            aria-label="Global"
            className="flex items-center justify-between py-6"
          >
            <div className="flex lg:flex-1">
              <span className="sr-only">GoodSeva</span>
              <Link href={"/"}>
                <img
                  src="/goodseva-logo.png"
                  alt="Goodseva-logo"
                  className="h-12 w-auto"
                />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Open main menu</span>
                <Menu aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm/6 font-semibold text-gray-900"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Right side: Login/Logout and Get Started buttons */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {loggedUser.userId ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="button-secondary mr-5"
                  >
                    Logout
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                  <Link href={"/dashboard"}>
                    <button type="button" className="button-primary">
                      Dasboard
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={"/login"}
                    className="button-secondary mr-5"
                    target="_blank"
                  >
                    Login <span aria-hidden="true">&rarr;</span>
                  </Link>
                  <Link
                    href={"/Register"}
                    className="button-primary"
                    target="_blank"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu (conditional render based on mobileMenuOpen state) */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
              <div className="bg-white p-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 text-2xl"
                >
                  X
                </button>
                <div className="flex flex-col mt-4">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <span
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm py-2 text-gray-900"
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                  {loggedUser.userId ? (
                    <>
                      <button
                        onClick={handleLogout}
                        className="text-sm py-2 text-gray-900 mt-4"
                      >
                        Logout
                      </button>
                      <Link href={"/profile"}>
                        <button
                          type="button"
                          className="button-primary text-sm py-2 mt-4"
                        >
                          Profile
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <span className="text-sm py-2 text-gray-900 mt-4">
                          Login
                        </span>
                      </Link>
                      <Link href={"/Register"}>
                        <button
                          type="button"
                          className="button-primary text-sm py-2 mt-4"
                        >
                          Get Started
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
