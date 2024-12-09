import axios from "axios";
import Keys from "../constants/keys";
import Secure from "../helpers/secureLS";
import { deleteCookie } from "cookies-next";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: Keys.API_URL,
});

axiosInstance.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axiosInstance.defaults.headers.common["Content-Type"] = "application/json";

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       deleteCookie("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
