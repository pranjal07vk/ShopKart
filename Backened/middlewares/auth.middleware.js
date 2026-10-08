import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const secretKey = process.env.JWT_SECRET || "shopkart_custom_secure_key_auth_2026";
    const decoded = jwt.verify(token, secretKey);

    const user = await Customer.findById(decoded.customerId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Customer not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};