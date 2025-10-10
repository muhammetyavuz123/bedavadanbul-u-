import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const workplaceName = formData.get("workplaceName");
    const role = userType === "business" ? "business" : "user";

    try {
      const res = await apiRequest.post("/auth/register", {
        workplaceName: workplaceName ? workplaceName : undefined,
        username,
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
  return (
    <>
      {/* <div className="registerPage">
       <div className="formContainer">
         <form onSubmit={handleSubmit}>
           <h1>Create an Account</h1>
           <input name="username" type="text" placeholder="Username" />
           <input name="email" type="text" placeholder="Email" />
           <input name="password" type="password" placeholder="Password" />
           <button disabled={isLoading}>Register</button>
           {error && <span>{error}</span>}
           <Link to="/login">Do you have an account?</Link>
         </form>
       </div>
       <div className="imgContainer">
         <img src="/bg.png" alt="" />
       </div>
     </div> */}
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
              <input name="username" type="text" placeholder="Kullanıcı Adı" />
              <input name="email" type="text" placeholder="E-Posta" />
              <input name="password" type="password" placeholder="Şifre" />

              <button type="submit" disabled={isLoading}>
                Register
              </button>
              {error && <span>{error}</span>}
              <Link to="/login">
                <span
                  style={{
                    color: "#ff3c38",
                  }}
                >
                  Zaten bir hesabım var
                </span>
              </Link>
            </form>
          )}
          {userType === "business" && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h3>İşyeri Kaydı</h3>
              <input
                name="workplaceName"
                type="text"
                placeholder="Firma Adı"
                required
              />
              <input name="username" type="text" placeholder="Kullanıcı Adı" />
              <input name="email" type="text" placeholder="E Posta" />
              <input name="password" type="password" placeholder="Şifre" />
              <button type="submit" disabled={isLoading}>
                Register
              </button>
              {error && <span>{error}</span>}
              <Link to="/login">
                <span
                  style={{
                    color: "#ff3c38",
                  }}
                >
                  Zaten bir hesabım var
                </span>
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
    </>
  );
}

export default Register;
