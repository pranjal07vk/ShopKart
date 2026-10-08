import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { totalItemCount } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");

      navigate("/login");
    } catch (error) {
      console.log("Logout failed");
    }
  };

  return (
    <nav>
      <h2>ShopKart</h2>

      <button onClick={() => navigate("/home")}>
        Home
      </button>

      <button onClick={() => navigate("/products")}>
        Products
      </button>

      <button onClick={() => navigate("/wishlist")}>
        Wishlist
      </button>

      <button onClick={() => navigate("/cart")}>
        Cart ({totalItemCount})
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;