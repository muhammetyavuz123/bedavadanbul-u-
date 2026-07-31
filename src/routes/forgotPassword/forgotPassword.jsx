import { useState } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import "./register.scss";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiRequest.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setSent(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2>
          <FiMail /> Şifremi Unuttum
        </h2>
        <p className="subText">
          E-posta adresinizi girin, şifrenizi sıfırlamanız için bir bağlantı
          gönderelim.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading || sent}>
            {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>

          {message && (
            <p className={`match-text ${sent ? "success" : "error"}`}>
              {sent && <FiCheckCircle />} {message}
            </p>
          )}

          <Link to="/login">
            <span className="accountLink backLink">
              <FiArrowLeft /> Girişe Dön
            </span>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
}
