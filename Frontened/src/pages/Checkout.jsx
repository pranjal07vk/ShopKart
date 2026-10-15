
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cartItems, subtotal, loading, error, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(initialAddress);
  const [formError, setFormError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleChange = (event) => {
    setAddress({
      ...address,
      [event.target.name]: event.target.value,
    });
  };

  const validateAddress = () => {
    for (const [key, value] of Object.entries(address)) {
      if (!value.trim()) {
        return "Please fill in all shipping address fields.";
      }
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return "Pincode must contain exactly 6 digits.";
    }

    return "";
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setFormError("");

    const validationError = validateAddress();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    setProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay. Check your internet connection.");
      }

      // The backend calculates the real total from the saved cart.
      const response = await api.post("/orders/create-payment-order", {
        shippingAddress: address,
      });

      const paymentOrder = response.data;

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: paymentOrder.name,
        description: paymentOrder.description,
        order_id: paymentOrder.razorpayOrderId,

        prefill: paymentOrder.prefill,

        handler: async function (paymentResponse) {
          try {
            const verification = await api.post("/orders/verify-payment", {
              orderId: paymentOrder.orderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verification.data.success) {
              await refreshCart();
              navigate(`/order-success/${paymentOrder.orderId}`);
            } else {
              setFormError("Payment verification failed. Please contact support before retrying.");
            }
          } catch (verificationError) {
            setFormError(
              verificationError.response?.data?.message ||
                "Payment verification could not be completed. Do not pay again yet; check your order status first."
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setFormError(
          response.error?.description || "Payment failed. Your cart has been kept."
        );
        setProcessing(false);
      });

      razorpay.open();
    } catch (checkoutError) {
      setFormError(
        checkoutError.response?.data?.message ||
          checkoutError.message ||
          "Could not start checkout."
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return <p>Loading your cart...</p>;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {error && <p role="alert">{error}</p>}

      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          <form onSubmit={handleCheckout} className="checkout-form">
            <h2>Shipping Address</h2>

            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={address.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <label htmlFor="phone">Mobile Number</label>
            <input
              id="phone"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              required
            />

            <label htmlFor="addressLine1">Address</label>
            <input
              id="addressLine1"
              name="addressLine1"
              value={address.addressLine1}
              onChange={handleChange}
              autoComplete="street-address"
              required
            />

            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={address.city}
              onChange={handleChange}
              autoComplete="address-level2"
              required
            />

            <label htmlFor="state">State</label>
            <input
              id="state"
              name="state"
              value={address.state}
              onChange={handleChange}
              autoComplete="address-level1"
              required
            />

            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              required
            />

            {formError && <p role="alert">{formError}</p>}

            <button type="submit" disabled={processing || cartItems.length === 0}>
              {processing ? "Processing..." : "Pay with Razorpay"}
            </button>

            <p>Test Mode only. No real payment should be made.</p>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.product._id}>
                <p>{item.product.name}</p>
                <p>
                  ₹{item.product.price} × {item.quantity} = ₹
                  {(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <hr />
            <h3>Total: ₹{subtotal.toFixed(2)}</h3>
            <p>The final amount is calculated and validated by the server.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
