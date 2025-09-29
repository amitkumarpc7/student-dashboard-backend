import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema({
  payload: Object,
  receivedAt: { type: Date, default: Date.now },
});

export default mongoose.model("WebhookLog", webhookLogSchema);
