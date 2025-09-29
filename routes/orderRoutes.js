import express from "express";
import { createPayment } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/create-payment", protect, createPayment);
// router.post("/create-payment", createPayment);

export default router;
