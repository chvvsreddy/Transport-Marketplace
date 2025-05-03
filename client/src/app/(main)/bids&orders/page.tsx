"use client";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { getBids, getLoads } from "@/state/api";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Select,
} from "antd";
import { SocketContext } from "@/app/util/SocketContext";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

type Address = {
  address: string;
  lat: number;
  lng: number;
  city: string;
};

interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  price: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface Load {
  id: string;
  shipperId: string;
  origin: Address;
  destination: Address;
  bidPrice: number;
  status: "AVAILABLE" | "ASSIGNED" | "COMPLETED";
  createdAt: string;
}

interface User {
  userId: string;
  type: string;
}

export default function BidsAndOthers() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [bidStatusFilter, setBidStatusFilter] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | "ALL"
  >("PENDING");

  const pageSize = 5;
  const router = useRouter();
  const { socket } = useContext(SocketContext) || {};
  useEffect(() => {
    const user = getLoggedUserFromLS();
    setLoggedUser(user);

    if (!user || user.type === "INDIVIDUAL_DRIVER" || user.type === "ADMIN") {
      router.push("/login");
      return;
    }

    async function fetchData() {
      const allLoads = await getLoads();
      const allBids = await getBids();
      setLoads(allLoads);
      setBids(allBids);
      setFilteredLoads(allLoads);
    }

    fetchData();

    socket?.on("receiveUpdatedBidPrice", (updatedBid: Bid) => {
      setBids((prevBids) => {
        const index = prevBids.findIndex((b) => b.id === updatedBid.id);
        if (index !== -1) {
          return prevBids.map((b) =>
            b.id === updatedBid.id ? { ...b, ...updatedBid } : b
          );
        } else {
          return [...prevBids, updatedBid];
        }
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleAcceptBid = (bidId: string) => {
    console.log("Accepting bid:", bidId);
  };

  const handleNegotiateBid = (bid: Bid, load: Load) => {
    setSelectedBid(bid);
    setSelectedLoad(load);
    setNegotiatedPrice(bid.price);
    setIsModalVisible(true);
  };

  const handleSubmitNegotiation = () => {
    if (!selectedBid || !loggedUser || negotiatedPrice == null) return;

    socket?.emit("updateBidAmount", {
      bidId: selectedBid.id,
      shipperId: loggedUser.userId,
      price: negotiatedPrice,
    });

    message.success("Bid updated successfully");
    setIsModalVisible(false);
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffMs = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const handleDateChange = (dates: any) => {
    if (!dates) {
      setFilteredLoads(loads);
      setDateRange(null);
      return;
    }

    const [start, end] = dates;
    const startDate = new Date(start.$d);
    const endDate = new Date(end.$d);
    setDateRange([startDate, endDate]);

    const filtered = loads.filter((load) => {
      const created = new Date(load.createdAt);
      return created >= startDate && created <= endDate;
    });
    setFilteredLoads(filtered);
    setCurrentPage(1);
  };

  const filteredAvailableLoads = filteredLoads.filter(
    (load) =>
      load.shipperId === loggedUser?.userId && load.status === "AVAILABLE"
  );

  const loadsWithMatchingBids = filteredAvailableLoads.filter((load) =>
    bids.some(
      (bid) =>
        bid.loadId === load.id &&
        (bidStatusFilter === "ALL" || bid.status === bidStatusFilter)
    )
  );

  const totalPages = Math.ceil(loadsWithMatchingBids.length / pageSize);

  const paginatedLoads = loadsWithMatchingBids.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Bids and Orders</Title>

      <div style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
        <DatePicker.RangePicker onChange={handleDateChange} />
        <Select
          defaultValue="PENDING"
          value={bidStatusFilter}
          onChange={(value: any) => {
            setBidStatusFilter(value);
            setCurrentPage(1);
          }}
          style={{ width: 160 }}
        >
          <Option value="ALL">All Bids</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="ACCEPTED">Accepted</Option>
          <Option value="REJECTED">Rejected</Option>
        </Select>
      </div>

      {paginatedLoads.map((load) =>
        bids
          .filter(
            (bid) =>
              bid.loadId === load.id &&
              (bidStatusFilter === "ALL" || bid.status === bidStatusFilter)
          )
          .map((bid) => (
            <Card key={bid.id} style={{ marginBottom: "20px" }}>
              <Title level={4}>
                {load.origin.city} ➝ {load.destination.city}
              </Title>
              <Paragraph>
                <strong>Load ID:</strong> {load.id}
              </Paragraph>
              <Paragraph>
                <strong>Driver ID:</strong> {bid.carrierId}
              </Paragraph>
              <Paragraph>
                <strong>Actual Price:</strong> ₹{load.bidPrice}
              </Paragraph>
              <Paragraph>
                <strong>Current Ongoing Bidding Price:</strong> ₹{bid.price}
              </Paragraph>
              <Paragraph>{`Posted ${timeAgo(load.createdAt)}`}</Paragraph>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {bid.status === "PENDING" && (
                  <>
                    <Button
                      type="primary"
                      onClick={() => handleAcceptBid(bid.id)}
                    >
                      Accept
                    </Button>
                    <Button onClick={() => handleNegotiateBid(bid, load)}>
                      Negotiate
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
      )}

      {loadsWithMatchingBids.length > pageSize && (
        <div className="flex justify-center mt-6 items-center gap-4">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        title="Negotiate Bid"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitNegotiation}
        okText="Submit Bid"
      >
        {selectedLoad && selectedBid && (
          <>
            <Paragraph>
              <strong>Route:</strong> {selectedLoad.origin.city} ➝{" "}
              {selectedLoad.destination.city}
            </Paragraph>
            <Paragraph>
              <strong>Actual Price:</strong> ₹{selectedLoad.bidPrice}
            </Paragraph>
            <Paragraph>
              <strong>Current Ongoing Price:</strong> ₹{selectedBid.price}
            </Paragraph>
            <Paragraph>
              <strong>Enter New Offer:</strong>
            </Paragraph>
            <Input
              type="number"
              value={negotiatedPrice ?? ""}
              onChange={(e) => setNegotiatedPrice(Number(e.target.value))}
              min={0}
              prefix="₹"
            />
          </>
        )}
      </Modal>
    </div>
  );
}
