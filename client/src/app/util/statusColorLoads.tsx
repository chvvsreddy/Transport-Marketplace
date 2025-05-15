export const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-200";
    case "IN_PROGRESS":
      return "bg-blue-200";
    case "COMPLETED":
      return "bg-gray-200";
    case "CANCELLED":
      return "bg-red-200";
    case "PENDING":
      return "bg-orange-200";
    default:
      return "bg-yellow-200";
  }
};
