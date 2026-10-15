
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


/* ================================
   ORDER SUCCESS PAGE
================================ */

.order-success {
  width: min(680px, calc(100% - 32px));
  margin: 60px auto;
  padding: 40px;
  color: var(--text-main);
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

/* Main heading */

.order-success h1 {
  margin: 0 0 14px;
  font-size: clamp(25px, 4vw, 32px);
  font-weight: 750;
  letter-spacing: -0.8px;
}

/* Confirmation message */

.order-success > p {
  margin: 0 0 28px;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}

/* Order information */

.order-success-details {
  margin: 28px 0;
  padding: 12px 20px;
  text-align: left;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.order-success-details p {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin: 0;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.order-success-details p:last-child {
  border-bottom: none;
}

.order-success-details strong {
  flex-shrink: 0;
  color: var(--text-main);
  font-weight: 650;
}

.order-success-details p {
  color: var(--text-muted);
}

/* Navigation buttons */

.order-success-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.order-success-actions a,
.order-success > a {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 46px;
  padding: 12px 20px;
  color: #fff;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.order-success-actions a:hover,
.order-success > a:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Error message */

.order-success [role="alert"] {
  margin: 20px 0;
  padding: 14px;
  color: var(--danger);
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
}

/* Mobile */

@media (max-width: 520px) {
  .order-success {
    margin: 28px auto;
    padding: 26px 18px;
    border-radius: 15px;
  }

  .order-success-details {
    padding: 8px 14px;
  }

  .order-success-details p {
    gap: 10px;
    font-size: 12px;
  }

  .order-success-actions {
    flex-direction: column;
  }

  .order-success-actions a {
    width: 100%;
  }
}
