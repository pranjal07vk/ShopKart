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
        setError("Something went wrong while loading your wishlist.");
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
      await api.delete(`/wishlist/${productId}`);

      setWishlist((currentWishlist) =>
        currentWishlist.filter((product) => product._id !== productId)
      );
    } catch (error) {
      setError("Could not remove the product from wishlist.");
    }
  };

  if (loading) {
    return <p>Loading wishlist...</p>;
  }

  return (
    <div className="wishlist-page">
      <h1>My Wishlist</h1>

      {error && <p>{error}</p>}

      {!error && wishlist.length === 0 && (
        <div>
          <h2>Your wishlist is empty</h2>
          <p>Add products to your wishlist to see them here.</p>

          <button onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      )}

      {!error && wishlist.length > 0 && (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div className="wishlist-card" key={product._id}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <h2>{product.name}</h2>

              <p>{product.category}</p>

              <p>₹{product.price}</p>

              <p>
                {product.stock > 0
                  ? `${product.stock} units left`
                  : "Out of stock"}
              </p>

              <button
                onClick={() =>
                  navigate(`/products/${product._id}`)
                }
              >
                View Details
              </button>

              <button onClick={() => handleRemove(product._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;