import axios from "axios";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 401 YAKALAMA
apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Kullanıcı bilgisini sil
      localStorage.removeItem("user");

      // Login sayfasına yönlendir
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiRequest;
