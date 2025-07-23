import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "./isTokenExpired";

interface DecodedUser {
  userId: string;
  email: string;
  phone: string;
  type: string;
  exp: number;
  iat: number;
}

interface FallbackUser {
  userId: "no user";
  type: "no";
  email: "";
  phone: "";
}

export type LoggedUser = DecodedUser | FallbackUser;

export function getLoggedUserFromLS(): LoggedUser {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");

    return {
      userId: "no user",
      type: "no",
      email: "",
      phone: "",
    };
  }

  const userObj = jwtDecode<DecodedUser>(token);

  return userObj;
}
