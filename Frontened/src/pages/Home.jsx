import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await api.get("/customers/me");

        setUser(response.data);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <Navbar />

      <div className="home-container">
        <h1>Welcome to ShopKart</h1>

        {user && (
          <div className="profile-card">
            <h2>Hello, {user.fullName}!</h2>

            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>

            <button onClick={() => navigate("/products")}>
              View Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;