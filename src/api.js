import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER}`,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  async error => {
    const msg = error.response?.data?.message;
    if (error.response?.status === 401 && msg === "Access token expired") {
      try {
        const refresh = await axios.post("/users/auth/refresh-token", {}, { withCredentials: true });
        if (refresh.status === 200) {
          error.config.headers["Authorization"] = `Bearer ${refresh.data.accessToken}`;
          return api(error.config);
        }
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;


