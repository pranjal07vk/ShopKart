import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        setError("Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="product-details">
      <img
        src={product.image}
        alt={product.name}
        className="product-details-image"
      />

      <div className="product-details-info">
        <h1>{product.name}</h1>

        <p className="product-details-category">
          {product.category}
        </p>

        <p className="product-details-description">
          {product.description}
        </p>

        <p className="product-details-price">
          ₹{product.price}
        </p>

        <p>
          {product.stock > 0
            ? `${product.stock} units left`
            : "Out of stock"}
        </p>

        <button>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;