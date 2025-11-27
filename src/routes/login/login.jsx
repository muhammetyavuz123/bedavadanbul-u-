import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 Göz ikonları

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 Şifre görünürlüğü

  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);

    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/auth/login", {
        identifier,
        password,
      });

      updateUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2>Giriş Yap</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Cep Telefonu veya E-posta"
            required
            name="identifier"
          />

          {/* Şifre alanı + ikon */}
          <div className="input-with-icon">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              required
              name="password"
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-eye-off"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.29-3.14-11-8 1.21-3.16 3.52-5.7 6.36-7.19" />
                  <path d="M1 1l22 22" />
                  <path d="M9.53 9.53A3.5 3.5 0 0 0 14.47 14.47" />
                  <path d="M21.17 12.95a10.94 10.94 0 0 0-3.12-4.29" />
                </svg>
              ) : (
                "👁️"
              )}
            </span>
          </div>
          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={isLoading}>
            Giriş Yap
          </button>

          <Link to="/forgot-password">
            <span className="link-danger">Şifremi Unuttum</span>
          </Link>
          <Link to="/register">
            <span className="link-danger">Kayıt Oluştur</span>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;
