"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Heading from "@/app/util/Heading/index";
import { useSearch } from "@/app/util/SearchContext";
import { getAllUsers } from "@/state/api";

const USERS_PER_PAGE = 6;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const fetchUsers = async () => {
      const gettedAllUsers = await getAllUsers();
      setUsers(gettedAllUsers);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (person: any) =>
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
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
                  href={`/admin/dashboard/usermanagement/${person.id}`}
                  className="flex justify-between gap-x-6 px-4"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
                      {person.type.toLowerCase()}
                    </p>
                    {person.lastSeen ? (
                      <p className="mt-1 text-xs/5 text-gray-500">
                        Last seen{" "}
                        <time dateTime={person.lastSeenDateTime}>30</time>
                      </p>
                    ) : (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs/5 text-gray-500">Online</p>
                      </div>
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
    </>
  );
};

export default Users;
