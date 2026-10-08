import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", authenticate, addToWishlist);
router.get("/", authenticate, getWishlist);
router.delete("/:productId", authenticate, removeFromWishlist);

export default router;