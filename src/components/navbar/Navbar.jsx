import { useContext, useState } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";
import apiRequest from "../../lib/apiRequest";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);

  const fetch = useNotificationStore((state) => state.fetch);
  const number = useNotificationStore((state) => state.number);

  // if (currentUser) fetch();
  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ya da kendi default icon'un

  return (
    <nav>
      <div className="left">
        <a href="/" className="logo">
          <img src="/logo.png" alt="" />
          {/* <span>Kampanyadan</span> */}
        </a>
        <a href="/">Ana Sayfa</a>
        <a href="/list">Kampanyalar</a>

        <a href="/aboutUs">Hakkımızda</a>
        <a href="/contact">İletişim</a>
      </div>
      <div className="right">
        {currentUser ? (
          <div className="user">
            <img src={currentUser.avatar || defaultAvatar} alt="" />
            <span>{currentUser.username}</span>
            {currentUser.role !== "user" ? (
              <Link to="/profile" className="profile">
                {number > 0 && <div className="notification">{number}</div>}
                <span style={{ color: "white" }}>Profil</span>
              </Link>
            ) : (
              <button
                to="/login"
                className="profile"
                style={{ marginLeft: "10px" }}
                onClick={handleLogout}
              >
                {number > 0 && <div className="notification">{number}</div>}
                <span style={{ color: "white" }}>Çıkış</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <a style={{ color: "white" }} href="/login" className="register">
              Giriş
            </a>
          </>
        )}
        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
        <div className={open ? "menu active" : "menu"}>
          <a href="/">Ana Sayfa</a>
          <a href="/list">Kampanyalar</a>
          <a href="/aboutUs">Hakkımızda</a>
          <a href="/contact">İletişim</a>
          {currentUser ? (
            <div className="user">
              <img src={currentUser.avatar || defaultAvatar} alt="" />
              <span>{currentUser.username}</span>
              {currentUser.role !== "user" ? (
                <Link to="/profile" className="profile">
                  {number > 0 && <div className="notification">{number}</div>}
                  <span style={{ color: "white" }}>Profil</span>
                </Link>
              ) : (
                <button
                  to="/login"
                  className="profile"
                  style={{ marginLeft: "10px" }}
                  onClick={handleLogout}
                >
                  {number > 0 && <div className="notification">{number}</div>}
                  <span style={{ color: "white" }}>Çıkış</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <a style={{ color: "white" }} href="/login" className="register">
                Giriş
              </a>
            </>
          )}{" "}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
