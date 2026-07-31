import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
} from "react-icons/fi";
import "./resetPassword.scss";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;

    setIsLoading(true);
    setMessage("");
    try {
      const res = await apiRequest.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(res.data.message || "Şifreniz başarıyla güncellendi.");
      setSuccess(true);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data ||
          "Bir hata oluştu.",
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2>
          <FiLock /> Yeni Şifre Belirle
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-with-icon">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Yeni şifre (tekrar)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {passwordsMatch && (
            <p
              className={`match-text ${
                newPassword === confirmPassword ? "success" : "error"
              }`}
            >
              {newPassword === confirmPassword ? (
                <>
                  <FiCheckCircle /> Şifreler eşleşiyor
                </>
              ) : (
                <>
                  <FiXCircle /> Şifreler uyuşmuyor
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isLoading || !newPassword || newPassword !== confirmPassword
            }
          >
            {isLoading ? "Gönderiliyor..." : "Şifreyi Sıfırla"}
          </button>

          {message && (
            <p className={`match-text ${success ? "success" : "error"}`}>
              {success ? <FiCheckCircle /> : <FiXCircle />} {message}
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
