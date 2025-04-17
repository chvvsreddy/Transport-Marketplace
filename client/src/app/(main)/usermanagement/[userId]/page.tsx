"use client";

import { getUser } from "@/state/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Profile from "../../profile/page";
import { useUser } from "@/app/util/UserContext";

const UserDetail = () => {
  const { userId } = useParams();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getUser(userId as string);
          setUser(data);
        } catch (err) {
          setError("Failed to load user details. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [userId]);

  console.log(user);

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <Profile />
    </div>
  );
};

export default UserDetail;
