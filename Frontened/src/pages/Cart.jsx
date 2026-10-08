import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    refreshCart,
    subtotal,
  } = useCart();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <h1>Shopping Cart</h1>
          <p>Loading cart...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <h1>Shopping Cart</h1>
          <p>{error}</p>
          <button onClick={refreshCart}>Retry</button>
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <h1>Shopping Cart</h1>
          <p>Your cart is empty.</p>

          <button onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1>Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div
                className="cart-item"
                key={item.product._id}
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-image"
                />

                <div className="cart-item-info">
                  <h2>{item.product.name}</h2>

                  <p>{item.product.category}</p>

                  <p>₹{item.product.price}</p>

                  <p>
                    {item.product.stock} units available
                  </p>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                      disabled={
                        item.quantity >= item.product.stock
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.product._id)
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-total">
                  ₹{item.product.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <p>
              Items:{" "}
              {cartItems.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </p>

            <h3>Subtotal: ₹{subtotal}</h3>

            <button onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;