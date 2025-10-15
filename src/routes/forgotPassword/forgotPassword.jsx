// ForgotPassword.js
import { useState } from "react";
import axios from "axios";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Bir hata oluştu.");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="link-danger">Şifremi Unuttum</span>

          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Gönder</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </AuthLayout>
  );
}
