import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:1108",
  withCredentials: true,
});

export default api;