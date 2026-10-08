import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist");

      setWishlist(response.data.wishlist);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Unable to load wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setError("");

      await api.delete(`/wishlist/${productId}`);

      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (product) => product._id !== productId
        )
      );
    } catch (error) {
      setError("Could not remove the product from wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="wishlist-state">
        <div className="wishlist-state-icon">♡</div>
        <h2>Loading your wishlist...</h2>
        <p>Please wait while we fetch your saved products.</p>
      </div>
    );
  }

  if (error && wishlist.length === 0) {
    return (
      <div className="wishlist-state">
        <div className="wishlist-state-icon">⚠</div>
        <h2>Unable to load wishlist.</h2>
        <p>{error}</p>

        <button
          className="wishlist-primary-button"
          onClick={fetchWishlist}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p>Your saved products, all in one place.</p>
        </div>

        <button
          className="continue-shopping-button"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
      </div>

      {error && (
        <div className="wishlist-error">
          <p>{error}</p>
        </div>
      )}

      {wishlist.length === 0 && !error && (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">♡</div>

          <h2>Your wishlist is empty ❤️</h2>

          <p>
            Start saving products you love.
          </p>

          <button
            className="wishlist-primary-button"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      )}

      {wishlist.length > 0 && (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div className="wishlist-card" key={product._id}>
              <div className="wishlist-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="wishlist-image"
                />
              </div>

              <div className="wishlist-card-content">
                <p className="wishlist-category">
                  {product.category}
                </p>

                <h2>{product.name}</h2>

                <p className="wishlist-price">
                  ₹{product.price}
                </p>

                <p
                  className={
                    product.stock > 0
                      ? "wishlist-stock"
                      : "wishlist-out-of-stock"
                  }
                >
                  {product.stock > 0
                    ? `${product.stock} units left`
                    : "Out of stock"}
                </p>

                <div className="wishlist-actions">
                  <button
                    className="wishlist-view-button"
                    onClick={() =>
                      navigate(`/products/${product._id}`)
                    }
                  >
                    View Details
                  </button>

                  <button
                    className="wishlist-remove-button"
                    onClick={() =>
                      handleRemove(product._id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;