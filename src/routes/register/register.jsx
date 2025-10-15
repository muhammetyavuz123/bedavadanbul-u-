import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import InputMask from "react-input-mask";
import { normalizePhone } from "../../lib/normalizePhone";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const rawPhone = formData.get("phone");
    const phone = normalizePhone(rawPhone);
    const email = formData.get("email");
    const password = formData.get("password");
    const workplaceName = formData.get("workplaceName");
    const role = userType === "business" ? "business" : "user";

    try {
      const res = await apiRequest.post("/auth/register", {
        workplaceName: workplaceName ? workplaceName : undefined,
        username,
        phone,
        email,
        password,
        role,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordFields = () => (
    <>
      <div className="input-group">
        <div className="input-with-icon">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
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
      </div>

      <div className="input-group">
        <div className="input-with-icon">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Şifre (Tekrar)"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? (
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
      </div>

      {confirm && (
        <p
          className={
            password === confirm ? "match-text success" : "match-text error"
          }
        >
          {password === confirm
            ? "✅ Şifreler eşleşiyor"
            : "❌ Şifreler uyuşmuyor"}
        </p>
      )}
    </>
  );

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2>Kayıt Ol</h2>

        {!userType && (
          <div className="select-type">
            <p>Devam etmek için bir tür seçin:</p>
            <button onClick={() => setUserType("user")}>
              Bireysel Kullanıcı
            </button>
            <button onClick={() => setUserType("business")}>İşyeri</button>
          </div>
        )}

        {userType === "user" && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>Bireysel Kullanıcı Kaydı</h3>
            <input
              name="username"
              type="text"
              placeholder="Kullanıcı Adı"
              required
            />
            <input name="email" type="email" placeholder="E-Posta" required />
            {/* <input
              name="phone"
              type="text"
              placeholder="Cep Telefon Numarası"
              required
            /> */}
            <InputMask mask="+90 (599) 999 99 99">
              {(inputProps) => (
                <input
                  {...inputProps}
                  name="phone"
                  type="text"
                  placeholder="Cep Telefon Numarası"
                  required
                />
              )}
            </InputMask>

            {renderPasswordFields()}

            <button type="submit" disabled={isLoading || password !== confirm}>
              {isLoading ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
            {error && <span className="error-text">{error}</span>}
            <Link to="/login">
              <span style={{ color: "#ff3c38" }}>Zaten bir hesabım var</span>
            </Link>
          </form>
        )}

        {userType === "business" && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>İşyeri Kaydı</h3>
            <input
              name="username"
              type="text"
              placeholder="Firma Adı"
              required
            />
            <input name="email" type="email" placeholder="E-Posta" required />
            <InputMask mask="+90 (599) 999 99 99">
              {(inputProps) => (
                <input
                  {...inputProps}
                  name="phone"
                  type="text"
                  placeholder="Cep Telefon Numarası"
                  required
                />
              )}
            </InputMask>
            <input
              name="workplaceName"
              type="text"
              placeholder="Sektör"
              required
            />

            {renderPasswordFields()}

            <button type="submit" disabled={isLoading || password !== confirm}>
              {isLoading ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
            {error && <span className="error-text">{error}</span>}
            <Link to="/login">
              <span style={{ color: "#ff3c38" }}>Zaten bir hesabım var</span>
            </Link>
          </form>
        )}

        {userType && (
          <button className="back-btn" onClick={() => setUserType("")}>
            ⬅ Geri
          </button>
        )}
      </div>
    </AuthLayout>
  );
}

export default Register;
