import express from "express";
import { getTransactionById } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Fetch single transaction by custom_order_id
router.get("/:custom_order_id", protect, getTransactionById);

export default router;
