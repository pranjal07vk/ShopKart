import express from "express";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", authenticate, addToCart);

router.get("/", authenticate, getCart);

router.patch("/:productId", authenticate, updateCartQuantity);

router.delete("/:productId", authenticate, removeFromCart);

export default router;