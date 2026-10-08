import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddToWishlist = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setMessage("");
      setSuccess(false);

      await api.post(`/wishlist/${product._id}`);

      setSuccess(true);
      setMessage("Added to Wishlist");
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage("Already in Wishlist");
      } else if (error.response?.status === 401) {
        setMessage("Please login to add to Wishlist");
      } else {
        setMessage("Could not add to Wishlist");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <div className="product-info">
        <h2>{product.name}</h2>

        <p className="product-category">{product.category}</p>

        <p className="product-price">₹{product.price}</p>

        <p className="product-stock">
          {product.stock > 0
            ? `${product.stock} units left`
            : "Out of stock"}
        </p>

        <button
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>

        <button
          onClick={handleAddToWishlist}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : success
            ? "♥ Added to Wishlist"
            : "♡ Add to Wishlist"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ProductCard;