import axios from "axios";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // API farklı bir domain'de çalışıyor (cross-origin). withCredentials
  // olmadan tarayıcı httpOnly "token" cookie'sini isteklere hiç eklemiyordu;
  // bu yüzden sunucudaki cookie tabanlı kontroller (örn. ilan sayfasında
  // "kaydedildi mi" bilgisi) production'da hiç çalışmıyordu.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// HER İSTEĞE TOKEN EKLE
apiRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 401 YAKALAMA
apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiRequest;
