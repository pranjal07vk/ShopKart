import jwt from "jsonwebtoken";

export const createSessionToken = (res, customerId) => {
  const secretKey = process.env.JWT_SECRET || "shopkart_custom_secure_key_auth_2026";

  const token = jwt.sign({ customerId }, secretKey, {
    expiresIn: "7d",
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};