import express from "express";
import {
    getTransactionById,
  getTransactions,
  getTransactionsBySchool,
} from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getTransactions);
router.get("/school/:schoolId", protect, getTransactionsBySchool);

export default router;
