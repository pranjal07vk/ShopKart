
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import razorpay from "../config/razorpay.js";
import mongoose from "mongoose";

// STEP 1: Create a Razorpay payment order
export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        const requiredFields = [
            "fullName",
            "phone",
            "addressLine1",
            "city",
            "state",
            "pincode",
        ];

        for (const field of requiredFields) {
            if (
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`,
                });
            }
        }

        const phone = shippingAddress.phone.trim();
        const pincode = shippingAddress.pincode.trim();

        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit Indian phone number",
            });
        }

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain exactly 6 digits",
            });
        }

        // Load the authenticated customer's cart
        const customer = await Customer.findById(req.user._id).populate(
            "cart.product"
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Revalidate products and calculate price on the server
        for (const cartItem of customer.cart) {
            const product = cartItem.product;

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists",
                });
            }

            const latestProduct = await Product.findById(product._id);

            if (!latestProduct) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is no longer available`,
                });
            }

            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity < 1 ||
                latestProduct.stock < cartItem.quantity
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${latestProduct.name}`,
                });
            }

            totalAmount += latestProduct.price * cartItem.quantity;

            orderItems.push({
                product: latestProduct._id,
                name: latestProduct.name,
                price: latestProduct.price,
                quantity: cartItem.quantity,
                image: latestProduct.image || "",
            });
        }

        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order total",
            });
        }

        // Create our own pending order first
        const order = await Order.create({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone,
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode,
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        // Razorpay expects the amount in paise (₹1 = 100 paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString(),
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            name: "ShopKart",
            description: "ShopKart purchase",
            prefill: {
                name: shippingAddress.fullName.trim(),
                contact: phone,
            },
        });
    } catch (error) {
        console.error("Create payment order error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not create payment order",
        });
    }
};

// STEP 2: Verify Razorpay payment signature
export const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are incomplete",
            });
        }

        // Find the order belonging to this customer
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Ensure this is the same Razorpay order we created
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID does not match",
            });
        }

        // Do not verify or process the same order twice
        if (order.paymentStatus === "PAID") {
            return res.status(409).json({
                success: false,
                message: "This order has already been paid",
            });
        }

        // Generate the expected HMAC SHA256 signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // Mark paid only after successful signature verification
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Clear the cart only after verified payment
        const customer = await Customer.findById(req.user._id);

        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            orderId: order._id,
            order,
        });
    } catch (error) {
        console.error("Verify payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not verify payment",
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch orders",
        });
    }
};

// STEP 4: Get one order belonging to the logged-in customer
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch order",
        });
    }
};
