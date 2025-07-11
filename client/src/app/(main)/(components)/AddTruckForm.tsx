import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import getTokenIdFromLs from "@/app/util/getTokenIdFromLS";
import { Form, Input, Select, DatePicker, Button, message, Space } from "antd";
import axios from "axios";
const { Option } = Select;
import dayjs from "dayjs";

interface VehicleFormValues {
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  capacity: string;
  length: string;
  width: string;
  height: string;
  vehicleType: string;
  isActive?: boolean;
  insuranceNumber: string;
  insuranceExpiry: dayjs.Dayjs;
  fitnessCertExpiry: dayjs.Dayjs;
  permitType?: string;
}

const AddTruckForm = () => {
  const [form] = Form.useForm();
  const token = getTokenIdFromLs();

  const onFinish = async (values: VehicleFormValues) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
        {
          registrationNumber: values.registrationNumber,
          make: values.make,
          model: values.model,
          year: parseInt(values.year, 10),
          capacity: parseFloat(values.capacity),
          dimensions: {
            length: parseFloat(values.length),
            width: parseFloat(values.width),
            height: parseFloat(values.height),
          },
          vehicleType: values.vehicleType,
          insuranceNumber: values.insuranceNumber,
          insuranceExpiry: values.insuranceExpiry.format("YYYY-MM-DD"),
          fitnessCertExpiry: values.fitnessCertExpiry.format("YYYY-MM-DD"),
          permitType: values.permitType || null,
          ownerId: getLoggedUserFromLS().userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Truck added successfully!");
      form.resetFields();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Server Response Error:", error.response.data);
          message.error(
            `Failed to add truck. Server said: ${error.response.data.message}`
          );
        } else if (error.request) {
          console.error("No Response from Server:", error.request);
          message.error("No response from server. Please check your network.");
        } else {
          console.error("Axios Error:", error.message);
          message.error("Unexpected error occurred.");
        }
      } else {
        console.error("Unknown Error:", error);
        message.error("An unknown error occurred.");
      }
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Registration Number"
        name="registrationNumber"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Make" name="make" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Model" name="model" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Year" name="year" rules={[{ required: true }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item
        label="Capacity (Kg)"
        name="capacity"
        rules={[{ required: true }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        label="Vehicle Type"
        name="vehicleType"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select Vehicle Type">
          <Option value="Trailer">Trailer</Option>
          <Option value="Container">Container</Option>
          <Option value="Flatbed">Flatbed</Option>
          <Option value="Refrigerated">Refrigerated</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Dimensions (m)">
        <Space.Compact>
          <Form.Item name="length" rules={[{ required: true }]}>
            <Input placeholder="Length" />
          </Form.Item>
          <Form.Item name="width" rules={[{ required: true }]}>
            <Input placeholder="Width" />
          </Form.Item>
          <Form.Item name="height" rules={[{ required: true }]}>
            <Input placeholder="Height" />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        label="Insurance Number"
        name="insuranceNumber"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Insurance Expiry Date"
        name="insuranceExpiry"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Fitness Certificate Expiry"
        name="fitnessCertExpiry"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item label="Permit Type" name="permitType">
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  );
};

export default AddTruckForm;
