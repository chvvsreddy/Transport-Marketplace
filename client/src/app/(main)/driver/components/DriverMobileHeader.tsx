import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";

export default function DriverMobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    type: "", // Add userType to loggedUser state
    email: "",
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);

      const currentUrl = window.location.pathname;
      const urlParts = currentUrl.split("/");
      const userTypeFromUrl = urlParts[1];
      let userType = userObj.type.split("_")[0].toLowerCase();
      if (userObj.type == "SHIPPER_COMPANY" && userTypeFromUrl == "shipper") {
        setLoggedUser(userObj);
      } else if (
        userObj.type == "INDIVIDUAL_SHIPPER" &&
        userTypeFromUrl == "individualShipper"
      ) {
        setLoggedUser(userObj);
      } else if (
        userObj.type == "LOGISTICS_COMPANY" &&
        userTypeFromUrl == "logistics"
      ) {
        setLoggedUser(userObj);
      } else if (
        userObj.type == "INDIVIDUAL_DRIVER" &&
        userTypeFromUrl == "driver"
      ) {
        setLoggedUser(userObj);
      } else if (userObj.type == "ADMIN" && userTypeFromUrl == "admin") {
        setLoggedUser(userObj);
      } else {
        router.push("/login");
        handleLogout();
      }
    } else {
      console.log("No user data found in localStorage.");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedUser({ message: "", userId: "", type: "", email: "" });
    router.push("/");
  };
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  //   const toggleSidebar = () => {
  //     dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  //   };
  //   const toggleDarkmode = () => {
  //     dispatch(setIsDarmode(!isDarkMode));
  //   };

  return (
    <div className="flex justify-between items-center px-4 py-2 md:hidden bg-white shadow-sm">
      <div className="text-xl font-bold text-[#6B0000]">SUVEGA</div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {loggedUser?.email.split("@")[0]}
        </span>
        <img
          src="/public/happy.jpg"
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
