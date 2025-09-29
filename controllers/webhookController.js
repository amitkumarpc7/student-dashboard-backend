import mongoose from "mongoose";
import WebhookLog from "../models/WebhookLog.js";
import OrderStatus from "../models/OrderStatus.js";

export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    await WebhookLog.create({ payload });

    const info = payload.order_info;
    if (!info) {
      return res.status(400).json({ message: "order_info missing" });
    }

    await OrderStatus.findOneAndUpdate(
      { collect_id: new mongoose.Types.ObjectId(info.order_id) },
      {
        collect_id: new mongoose.Types.ObjectId(info.order_id),
        order_amount: info.order_amount,
        transaction_amount: info.transaction_amount,
        gateway: info.gateway,
        bank_reference: info.bank_reference,
        status: info.status,
        payment_mode: info.payment_mode,
        // 🔑 map to the typo fields coming from webhook
        payment_details: info.payemnt_details,
        payment_message: info.Payment_message,
        payment_time: new Date(info.payment_time),
        error_message: info.error_message,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
