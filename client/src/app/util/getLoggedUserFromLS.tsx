import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "./isTokenExpired";

interface DecodedUser {
  userId: string;
  type: string;
  exp: number;
  iat: number;
}


export function getLoggedUserFromLS(): DecodedUser | "no user found" {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    console.log("no user found")
    return "no user found";
  }

  const userObj = jwtDecode<DecodedUser>(token);
  console.log(userObj)
  return userObj;
}

