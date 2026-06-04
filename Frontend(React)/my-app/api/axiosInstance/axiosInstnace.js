import axios from "axios";
import { basurl } from "../api_url/api_Url";

const axiosInstance = axios.create({
    baseURL:basurl
})
axiosInstance.interceptors.request.use(
  (config) => {

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export default axiosInstance