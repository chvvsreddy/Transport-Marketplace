

export default function getTokenIdFromLs(){
     const stored = localStorage.getItem("token");
  const { token } = stored ? JSON.parse(stored) : {};
  return token;
}