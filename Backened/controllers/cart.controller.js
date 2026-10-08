import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find logged-in customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 4. Check whether product is already in cart
    const existingItem = customer.cart.find(
      (item) => item.product.equals(productId)
    );

    // 5. Determine new quantity
    const newQuantity = existingItem
      ? existingItem.quantity + 1
      : 1;

    // 6. Check stock
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    // 7. Update existing item or add new item
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    // 8. Save customer
    await customer.save();

    // 9. Return updated cart
    const updatedCustomer = await Customer.findById(
      req.user._id
    ).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Validate quantity
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number of at least 1",
      });
    }

    // 3. Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 4. Check stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    // 5. Find customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 6. Find cart item
    const cartItem = customer.cart.find(
      (item) => item.product.equals(productId)
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // 7. Update quantity
    cartItem.quantity = quantity;

    // 8. Save
    await customer.save();

    // 9. Return updated cart
    const updatedCustomer = await Customer.findById(
      req.user._id
    ).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};