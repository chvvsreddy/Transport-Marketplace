"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Heading from "@/app/util/Heading/index";
import { useSearch } from "@/app/util/SearchContext";
import { getAllUsers } from "@/state/api";
import { SocketContext } from "@/app/util/SocketContext";

const USERS_PER_PAGE = 6;

const USER_TYPE_LABELS: { [key: string]: string } = {
  SHIPPER_COMPANY: "Shipper Company",
  INDIVIDUAL_SHIPPER: "Individual Shipper",
  LOGISTICS_COMPANY: "Logistics Company",
  INDIVIDUAL_DRIVER: "Individual Driver",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { searchTerm } = useSearch();
  const [userType, setUserType] = useState("All");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const { socket } = useContext(SocketContext) || {};
  useEffect(() => {
    // Register as admin to receive online users

    socket?.on("onlineUsers", (ids: string[]) => {
      console.log("online users", ids);
      setOnlineUserIds(ids);
    });

    return () => {
      socket?.off("online-users");
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    const fetchUsers = async () => {
      const gettedAllUsers = await getAllUsers();
      setUsers(gettedAllUsers.filter((u: any) => u.type !== "ADMIN"));
    };

    fetchUsers();
  }, []);

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((person: any) => {
    const matchesSearch =
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = userType === "All" || person.type === userType;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <>
      <Heading name="Users" />
      <div className={`bg-white p-4 m-4 rounded-xl shadow-md mt-4`}>
        {/* Dropdown filter */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label htmlFor="userType" className="text-sm text-gray-700">
            Filter by Type:
          </label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="All">All</option>
            {Object.entries(USER_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {currentUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            No users found.
          </div>
        ) : (
          <>
            <ul role="list" className="divide-y divide-gray-100">
              {currentUsers.map((person: any) => (
                <li
                  key={person.email}
                  className="py-5 hover:bg-gray-50 transition rounded-lg"
                >
                  <Link
                    href={`/usermanagement/${person.id}`}
                    className="flex justify-between gap-x-6 px-4"
                  >
                    <div className="flex min-w-0 gap-x-4">
                      <img
                        alt=""
                        src={person.profilePic}
                        className="size-12 flex-none rounded-full bg-gray-50"
                      />
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm/6 font-semibold text-gray-900">
                          {person.email.split("@")[0]}
                        </p>
                        <p className="mt-1 truncate text-xs/5 text-gray-500">
                          {person.email}
                        </p>
                      </div>
                    </div>
                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm/6 text-gray-900">
                        {USER_TYPE_LABELS[person.type] || person.type}
                      </p>
                      {onlineUserIds.includes(person.id) ? (
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-xs/5 text-green-500">Online</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs/5 text-gray-500">Offline</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Users;
