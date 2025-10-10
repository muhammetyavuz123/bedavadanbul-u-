import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setError(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {/* <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input
            name="identifier"
            required
            minLength={3}
            maxLength={20}
            type="text"
            placeholder="identifier"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
          />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div> */}
      <AuthLayout>
        <div className="auth-container">
          <h2>Giriş Yap</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="identifier"
              placeholder="Kullanıcı Adı veya E-posta"
              required
              name="identifier"
              // minLength={3}
              // maxLength={20}
            />
            <input
              type="password"
              placeholder="Şifre"
              required
              name="password"
            />
            <button type="submit" disabled={isLoading}>
              Giriş Yap
            </button>
            {error && <span>{error}</span>}
            <Link to="/forgot-password">
              <span
                style={{
                  color: "#ff3c38",
                }}
              >
                Şifremi Unuttum
              </span>
            </Link>
            <Link to="/register">
              <span
                style={{
                  color: "#ff3c38",
                }}
              >
                Kayıt Oluştur{" "}
              </span>
            </Link>
          </form>
        </div>
      </AuthLayout>
    </>
  );
}

export default Login;
