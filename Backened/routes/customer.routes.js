import express from "express";
import {
  signup,
  signin,
  getProfile,
  signout,
  updatePassword,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", signin);
router.get("/me", authenticate, getProfile);
router.post("/logout", authenticate, signout);
router.patch("/change-password", authenticate, updatePassword);

export default router;