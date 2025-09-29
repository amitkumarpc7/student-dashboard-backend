import axios from "axios";
import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";
import { signPayment } from "../utils/jwtSign.js";

export const createPayment = async (req, res) => {
  try {
    const { amount, student_info, gateway_name } = req.body;

    // 1️⃣ Save order first
    const order = await Order.create({
      school_id: process.env.SCHOOL_ID,
      student_info,
      gateway_name,
    });

    // 2️⃣ Create sign for payment API
    const sign = signPayment({
      school_id: process.env.SCHOOL_ID,
      amount,
      callback_url: process.env.CALLBACK_URL,
    });

    // 3️⃣ Call Payment API
    const { data } = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      {
        school_id: process.env.SCHOOL_ID,
        amount,
        callback_url: process.env.CALLBACK_URL,
        sign,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 4️⃣ Persist mapping so webhook can update this row later
    await OrderStatus.create({
      collect_id: order._id, // ObjectId matches orders._id for $lookup
      custom_order_id: data.collect_request_id, // gateway id (string)
      order_amount: Number(amount),
      status: "pending",
    });

    res.json({
      collect_request_id: data.collect_request_id,
      payment_url: data.collect_request_url,
      order_id: order._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment creation failed" });
  }
};
