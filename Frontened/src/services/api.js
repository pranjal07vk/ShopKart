
import axios from "axios";

const api = axios.create({
  baseURL: "https://shopkart-dbge.onrender.com",
  withCredentials: true,
});

export default api;
