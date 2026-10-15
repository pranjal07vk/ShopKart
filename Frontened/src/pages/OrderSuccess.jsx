
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        if (active) {
          setOrder(response.data.order);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Could not load order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (error) {
    return (
      <div className="order-success">
        <h1>Order Status</h1>
        <p role="alert">{error}</p>
        <Link to="/orders">View My Orders</Link>
      </div>
    );
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <div className="order-success">
      <h1>{paid ? "Order Placed Successfully!" : "Order Status"}</h1>

      <p>
        {paid
          ? "Thank you for shopping with ShopKart."
          : "Your order has not been confirmed as paid yet."}
      </p>

      <div className="order-success-details">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>

        <p>
          <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
        </p>

        <p>
          <strong>Payment:</strong> {order.paymentStatus}
        </p>

        <p>
          <strong>Order Status:</strong> {order.status}
        </p>
      </div>

      <div className="order-success-actions">
        <Link to="/orders">My Orders</Link>
        <Link to="/products">Continue Shopping</Link>
      </div>
    </div>
  );
}
