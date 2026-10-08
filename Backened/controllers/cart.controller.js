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