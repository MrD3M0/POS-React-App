import axios, { type AxiosInstance } from "axios";

// Create Axios Instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Pragma: "no-cache",
    "Cache-Control": "no-cache, no-store",
  },
});
export default axiosInstance;
