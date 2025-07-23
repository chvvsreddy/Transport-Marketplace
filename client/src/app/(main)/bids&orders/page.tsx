"use client";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { getAllUsers, getBids, getLoads } from "@/state/api";
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
  Col,
  Row,
  Spin,
} from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { SocketContext } from "@/app/util/SocketContext";

import Heading from "@/app/util/Heading";
import Shimmer from "../(components)/shimmerUi/Shimmer";
import { Tag } from "antd";
import { Dayjs } from "dayjs";

const { Paragraph, Text } = Typography;
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
  updatedAt: string;
  negotiateShipperPrice: number;
  negotiateDriverPrice: number;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
}

interface Load {
  id: string;
  shipperId: string;
  origin: Address;
  destination: Address;
  price: number;
  bidPrice: number;
  status: "AVAILABLE" | "ASSIGNED" | "COMPLETED";
  createdAt: string;
  pickupWindowStart: string;
}

interface User {
  userId: string;
  type: string;
}
interface SampleUser {
  id: string;
  email: string;
  type: string;
}

export default function BidsAndOthers() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [users, setUsers] = useState<SampleUser[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [bidStatusFilter, setBidStatusFilter] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | "ALL"
  >("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedLoadIds, setExpandedLoadIds] = useState<string[]>([]);

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const pageSize = 3;
  const router = useRouter();
  const { socket } = useContext(SocketContext) || {};

  const getStatusTag = (status: "PENDING" | "ACCEPTED" | "REJECTED") => {
    switch (status) {
      case "ACCEPTED":
        return <Tag color="green">Accepted</Tag>;
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>;
      case "PENDING":
      default:
        return <Tag color="gold">Pending</Tag>;
    }
  };
  useEffect(() => {
    const user = getLoggedUserFromLS();

    if (user.userId === "no user") {
      return router.push("/login");
    }
    if (user.type === "ADMIN") {
      setIsAdmin(true);
    }

    if (!user || user.type === "INDIVIDUAL_DRIVER") {
      router.push("/login");
      return;
    }
    setLoggedUser(user);
    async function fetchData() {
      const allLoads = await getLoads();
      const allBids = await getBids();
      const allUsers = await getAllUsers();
      setLoads(allLoads);
      setBids(allBids);
      setFilteredLoads(allLoads);
      setUsers(allUsers);
      setIsLoading(false);
      setLoading(false);
    }

    fetchData();
  }, [router]);
  useEffect(() => {
    if (!socket) return;

    const handleBidPrice = (updatedBid: Bid) => {
      message.success("Price updated by driver");

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

      setLoads((prevLoads) =>
        prevLoads.map((load) =>
          load.id === updatedBid.loadId
            ? { ...load, bidPrice: updatedBid.price }
            : load
        )
      );
    };

    const events = [
      "receiveUpdatedBidPrice",
      "receiveUpdatedBidStatus",
      "receiveNewBid",
      "receiveAfterDriverBidViaSocket",
      "receiveFixedLoad",
    ];
    events.forEach((event) => socket.on(event, handleBidPrice));

    return () => {
      events.forEach((event) => socket.off(event, handleBidPrice));
    };
  }, [socket]);

  function getTimeAgo(timestamp: string): string {
    const now = new Date();
    const updated = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - updated.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 3600 * 24 * 365,
      month: 3600 * 24 * 30,
      week: 3600 * 24 * 7,
      day: 3600 * 24,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return `${count} ${key}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  const handleAcceptBid = async (bidId: string, loadId: string) => {
    setLoading(true);
    console.log("Accepting bid:", bidId);
    const currentBid = bids.find((bid) => bid.id === bidId);
    const findUserIdByLoad = loads?.find(
      (load) => load.id === currentBid?.loadId
    );
    if (socket?.id) {
      socket?.emit("updateBidStatus", {
        bidId,
        shipperId: getLoggedUserFromLS().userId,
        loadId,
        toUser:
          getLoggedUserFromLS().type === "INDIVIDUAL_DRIVER"
            ? findUserIdByLoad?.shipperId
            : currentBid?.carrierId,
      });
    }
    setLoading(false);
  };

  const handleNegotiateBid = (bid: Bid, load: Load) => {
    setSelectedBid(bid);
    setSelectedLoad(load);
    setNegotiatedPrice(bid.price);
    setIsModalVisible(true);
  };

  const handleSubmitNegotiation = () => {
    setLoading(true);
    if (!selectedBid || !loggedUser || negotiatedPrice == null) {
      setLoading(false);
      return;
    }
    const findUserIdByLoad = loads.find(
      (load) => load.id === selectedBid.loadId
    );

    if (negotiatedPrice <= 0) {
      setLoading(false);
      return message.error("amount should be greater than zero");
    }
    if (socket?.id) {
      socket?.emit("updateBidAmount", {
        bidId: selectedBid.id,
        shipperId: loggedUser.userId,
        price: negotiatedPrice,
        toUser:
          loggedUser.type === "INDIVIDUAL_DRIVER"
            ? findUserIdByLoad?.shipperId
            : selectedBid.carrierId,
      });
      message.success("Bid updated successfully");
    }
    setIsModalVisible(false);
    setLoading(false);
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setFilteredLoads(loads);
      return;
    }

    const [start, end] = dates;
    const startDate = start.toDate();
    const endDate = end.toDate();

    const filtered = loads.filter((load) => {
      const created = new Date(load.createdAt);
      return created >= startDate && created <= endDate;
    });

    setFilteredLoads(filtered);
    setCurrentPage(1);
  };

  const toggleExpand = (loadId: string) => {
    setExpandedLoadIds((prev) =>
      prev.includes(loadId)
        ? prev.filter((id) => id !== loadId)
        : [...prev, loadId]
    );
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOriginSearch(originInput.toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [originInput]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDestinationSearch(destinationInput.toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destinationInput]);

  const filteredAvailableLoads = isAdmin
    ? filteredLoads
    : filteredLoads.filter(
        (load) =>
          load.shipperId === loggedUser?.userId &&
          load.origin.city.toLowerCase().includes(originSearch) &&
          load.destination.city.toLowerCase().includes(destinationSearch)
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

  const countOfLoadsofThisUser = isAdmin
    ? bids.filter((bid) => {
        return loads.some((load) => bid.loadId === load.id);
      })
    : bids.filter((bid) => {
        return loads.some(
          (load) =>
            bid.loadId === load.id &&
            load.shipperId === getLoggedUserFromLS().userId
        );
      });

  const countOfPendingLoadsofThisUser = isAdmin
    ? bids.filter((bid) => {
        return loads.some(
          (load) => bid.loadId === load.id && bid.status === "PENDING"
        );
      })
    : bids.filter((bid) => {
        return loads.some(
          (load) =>
            bid.loadId === load.id &&
            load.shipperId === getLoggedUserFromLS().userId &&
            bid.status === "PENDING"
        );
      });
  const countOfAcceptedLoadsofThisUser = isAdmin
    ? bids.filter((bid) => {
        return loads.some(
          (load) => bid.loadId === load.id && bid.status === "ACCEPTED"
        );
      })
    : bids.filter((bid) => {
        return loads.some(
          (load) =>
            bid.loadId === load.id &&
            load.shipperId === getLoggedUserFromLS().userId &&
            bid.status === "ACCEPTED"
        );
      });

  const acceptAfterDriverBid = (
    bidId: string,
    bidCarrierId: string,
    negotiateDriverPrice: number,
    loadId: string
  ) => {
    socket?.emit("acceptAfterDriverBidViaSocket", {
      bidId,
      shipperId: loggedUser?.userId,
      toUser: bidCarrierId,
      loadId,
      price: negotiateDriverPrice,
    });
  };

  return isLoading ? (
    <Shimmer />
  ) : (
    <>
      <Spin spinning={loading}>
        <Row className="pr-4">
          <Col span={24} md={6}>
            <Heading name="Bids and Orders" />
          </Col>
          <Col span={24} md={18}>
            <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
              <div className="page-filter-tabs active">
                {countOfLoadsofThisUser.length} All
              </div>
              <div className="page-filter-tabs">
                {countOfPendingLoadsofThisUser.length} Pending
              </div>
              <div className="page-filter-tabs">
                {countOfAcceptedLoadsofThisUser.length} Accepted
              </div>
              <div className="page-filter-tabs">0 No response</div>
            </div>
          </Col>
        </Row>

        <div className="main-content">
          <div className="flex gap-4">
            <DatePicker.RangePicker onChange={handleDateChange} />
            <Select
              defaultValue="PENDING"
              value={bidStatusFilter}
              onChange={(
                value: "PENDING" | "ACCEPTED" | "REJECTED" | "ALL"
              ) => {
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
            <Input
              placeholder="Search Origin City"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Search Destination City"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              style={{ width: 200 }}
            />
          </div>

          {paginatedLoads.map((load) => {
            const relatedBids = bids.filter(
              (bid) =>
                bid.loadId === load.id &&
                (bidStatusFilter === "ALL" || bid.status === bidStatusFilter)
            );

            return (
              <div
                key={load.id}
                className="!mt-4 rounded-md border-1 border-neutral-300"
              >
                <div className="p-2 px-4 flex justify-between items-center flex-col md:flex-row">
                  <p className="valueStyle">
                    {load.origin.city} ➝ {load.destination.city}
                  </p>
                  <p>
                    <span className="labelStyle">Load ID</span>
                    <br />
                    <span className="valueStyle">{load.id}</span>
                  </p>
                  <p>
                    <span className="labelStyle">Actual Price</span>
                    <br />
                    <span className="valueStyle">₹{load.price}</span>
                  </p>

                  <Button
                    type="link"
                    icon={
                      expandedLoadIds.includes(load.id) ? (
                        <UpOutlined />
                      ) : (
                        <DownOutlined />
                      )
                    }
                    onClick={() => toggleExpand(load.id)}
                  >
                    {expandedLoadIds.includes(load.id)
                      ? "Hide Bids"
                      : "Show Bids"}
                  </Button>
                </div>

                {expandedLoadIds.includes(load.id) &&
                  relatedBids.map((bid) => (
                    <Card
                      key={bid.id}
                      type="inner"
                      className="!bg-neutral-100 !rounded-0"
                    >
                      {isAdmin ? (
                        <>
                          <div className="flex flex-wrap justify-between">
                            <p>
                              <span className="labelStyle">
                                Driver Mail ID:
                              </span>
                              <br />
                              <span className="valueStyle">
                                {users.find((user) => user.id === bid.carrierId)
                                  ?.email || "Unknown Driver"}
                              </span>
                            </p>

                            <Paragraph>
                              Driver Negotiated Price :
                              {getTimeAgo(bid.updatedAt)}
                              <br />
                              <strong> ₹{bid.negotiateDriverPrice}</strong>
                            </Paragraph>
                            <Paragraph>
                              shipper negotiated Price :
                              <br />
                              <strong> ₹{bid.negotiateShipperPrice}</strong>
                            </Paragraph>
                            <Paragraph>
                              Final Price :
                              <br />
                              <strong> ₹{bid.negotiateShipperPrice}</strong>
                            </Paragraph>
                            <div>
                              {bid &&
                                bid.isDriverAccepted &&
                                bid.isShipperAccepted && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Text type="secondary">Status:</Text>
                                    {getStatusTag(bid.status)}
                                  </div>
                                )}
                              {bid.isDriverAccepted === false &&
                                bid.negotiateDriverPrice > 0 &&
                                bid.negotiateShipperPrice > 0 && (
                                  <span className=" max-h-10 text-red-800 text-sm">
                                    Waiting for driver response
                                  </span>
                                )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-wrap justify-between">
                            <p>
                              <span className="labelStyle">
                                Driver Mail ID:
                              </span>
                              <br />
                              <span className="valueStyle">
                                {users.find((user) => user.id === bid.carrierId)
                                  ?.email || "Unknown Driver"}
                              </span>
                            </p>

                            <Paragraph>
                              Driver Negotiated Price :{" "}
                              {getTimeAgo(bid.updatedAt)}
                              <br />
                              <strong> ₹{bid.negotiateDriverPrice}</strong>
                            </Paragraph>
                            <Paragraph>
                              Your negotiated Price :
                              <br />
                              <strong> ₹{bid.negotiateShipperPrice}</strong>
                            </Paragraph>
                            <Paragraph>
                              Final Price :
                              <br />
                              <strong> ₹{bid.negotiateShipperPrice}</strong>
                            </Paragraph>
                            <div>
                              {bid.status === "PENDING" && (
                                <>
                                  {bid &&
                                    bid.negotiateDriverPrice > 0 &&
                                    bid.negotiateShipperPrice === 0 && (
                                      <div className="flex flex-col sm:flex-row sm:gap-3 gap-2 justify-end mt-2">
                                        <Button
                                          className="border border-gray-300 rounded-md px-4 py-1 hover:border-gray-400"
                                          onClick={() =>
                                            handleNegotiateBid(bid, load)
                                          }
                                        >
                                          Negotiate
                                        </Button>

                                        <Button
                                          className="button-primary px-4 py-1 rounded-md"
                                          onClick={() =>
                                            acceptAfterDriverBid(
                                              bid.id,
                                              bid.carrierId,
                                              bid.negotiateDriverPrice,
                                              load.id
                                            )
                                          }
                                        >
                                          Accept
                                        </Button>
                                      </div>
                                    )}
                                  {bid.negotiateDriverPrice > 0 &&
                                    bid.negotiateShipperPrice > 0 &&
                                    bid.isDriverAccepted &&
                                    bid.isShipperAccepted === false && (
                                      <Button
                                        className="button-primary max-h-10"
                                        onClick={() =>
                                          handleAcceptBid(bid.id, load.id)
                                        }
                                      >
                                        Accept
                                      </Button>
                                    )}
                                </>
                              )}
                              {bid &&
                                bid.isDriverAccepted &&
                                bid.isShipperAccepted && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Text type="secondary">Status:</Text>
                                    {getStatusTag(bid.status)}
                                  </div>
                                )}
                              {bid.isDriverAccepted === false &&
                                bid.negotiateDriverPrice > 0 &&
                                bid.negotiateShipperPrice > 0 && (
                                  <span className=" max-h-10 text-red-800 text-sm">
                                    Waiting for driver response
                                  </span>
                                )}
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  ))}
              </div>
            );
          })}

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
      </Spin>
    </>
  );
}
