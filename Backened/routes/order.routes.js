
import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-payment-order", authenticate, createPaymentOrder);
router.post("/verify-payment", authenticate, verifyPayment);

router.get("/", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

export default router;
