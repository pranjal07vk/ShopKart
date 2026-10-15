
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");

        if (active) {
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Could not load your orders."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Loading your orders...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products">Explore Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <h2>Order #{order._id}</h2>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>

              <p>
                <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
              </p>

              <p>
                <strong>Payment:</strong> {order.paymentStatus}
              </p>

              <p>
                <strong>Status:</strong> {order.status}
              </p>

              <Link to={`/order-success/${order._id}`}>
                View Order Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
