import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      localStorage.setItem("token", res.data.token);

      updateUser(res.data.user);

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
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
