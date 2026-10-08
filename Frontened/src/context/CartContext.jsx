import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      setCartItems(response.data.cart || []);
    } catch (error) {
      if (error.response?.status === 401) {
        setCartItems([]);
      } else {
        setError("Could not load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      setError("");

      const response = await api.post(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Could not add to cart",
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setError("");

      const response = await api.patch(`/cart/${productId}`, {
        quantity,
      });

      setCartItems(response.data.cart || []);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Could not update quantity",
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError("");

      const response = await api.delete(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Could not remove from cart",
      };
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const totalItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        totalItemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}