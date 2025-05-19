export const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-yellow-200";
    case "ASSIGNED":
      return "bg-green-200";
    case "DELIVERED":
      return "bg-green-200";
    case "CANCELLED":
      return "bg-red-200";
    case "PENDING":
      return "bg-orange-200";
    case "IN_TRANSIT":
      return "bg-blue-200";
    default:
      return "bg-yellow-200";
  }
};

export const getStatusColorForTrips = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-200";
    case "IN_TRANSIT":
      return "bg-blue-200";
    default:
      return "bg-yellow-200";
  }
};

export const getStatusColorForBids = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-200";

    case "REJECTED":
      return "bg-red-200";
    case "PENDING":
      return "bg-orange-200";

    default:
      return "bg-yellow-200";
  }
};
