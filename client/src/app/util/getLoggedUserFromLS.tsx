export function getLoggedUserFromLS() {
  const storedUser = localStorage.getItem("token");
  if (storedUser) {
    const userObj = JSON.parse(storedUser);
    return userObj;
  } else {
    return "no user found";
  }
}
