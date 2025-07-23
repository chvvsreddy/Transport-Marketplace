"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getLoggedUserFromLS } from "./getLoggedUserFromLS";
import { getUser } from "@/state/api";

type User = {
  userId: string;
  email: string;
  type: string;
  phone: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User) => void;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserAndVerify = async () => {
      const storedUser = getLoggedUserFromLS();
      if (storedUser?.userId && storedUser.userId !== "no user") {
        setUser(storedUser);
        try {
          const checkingUser = await getUser(storedUser.userId);
          setIsVerified(!!checkingUser?.isVerified);
        } catch (error) {
          console.error("Error fetching user verification status", error);
        }
      }
    };

    fetchUserAndVerify();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isVerified, setIsVerified }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
