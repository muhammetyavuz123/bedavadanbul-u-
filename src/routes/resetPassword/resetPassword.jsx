// ResetPassword.js
import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data || "Bir hata oluştu.");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Yeni Şifre Belirle</h2>
          <input
            type="password"
            placeholder="Yeni şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Şifreyi Sıfırla</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </AuthLayout>
  );
}
