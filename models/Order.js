import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    school_id: { type: String, required: true },
    trustee_id: { type: String },
    student_info: {
      name: String,
      id: String,
      email: String,
    },
    gateway_name: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
