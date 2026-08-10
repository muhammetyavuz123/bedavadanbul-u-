import { useContext, useState } from "react";
import "./navbar.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";
import apiRequest from "../../lib/apiRequest";

const NAV_LINKS = [
  { to: "/", label: "Ana Sayfa", end: true },
  { to: "/list", label: "Kampanyalar" },
  { to: "/aboutUs", label: "Hakkımızda" },
  { to: "/contact", label: "İletişim" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const number = useNotificationStore((state) => state.number);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    } finally {
      setOpen(false);
    }
  };

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const isShopOrAdmin = currentUser && currentUser.role !== "user";

  return (
    <nav className="siteNavbar">
      <div className="left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Bedavadanbul" />
        </Link>

        <div className="navLinks">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="right">
        {currentUser ? (
          <div className="userArea">
            {isShopOrAdmin ? (
              <Link to="/profile" className="userChip">
                <div className="avatarWrap">
                  <img src={currentUser?.avatar || defaultAvatar} alt="" />
                  {number > 0 && (
                    <span className="notifBadge">
                      {number > 9 ? "9+" : number}
                    </span>
                  )}
                </div>
                <span className="userName">{currentUser?.username}</span>
              </Link>
            ) : (
              <button className="logoutBtnNav" onClick={handleLogout}>
                <img src={currentUser?.avatar || defaultAvatar} alt="" />
                <span>Çıkış</span>
              </button>
            )}
          </div>
        ) : (
          <Link to="/login" className="loginCta">
            Giriş Yap
          </Link>
        )}

        <div className="menuIcon">
          {/* ⚠️ Erişilebilirlik fix: önceden onClick doğrudan <img alt=""> üzerindeydi
              — bu hem klavyeyle odaklanılamıyordu hem de alt="" olduğu için ekran
              okuyucular menü butonunu hiç göremiyordu. Gerçek bir <button> yapıp
              aria-label ekledik. */}
          <button
            type="button"
            className="menuToggleBtn"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <img src="/menu.png" alt="" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={open ? "mobileOverlay show" : "mobileOverlay"}
        onClick={() => setOpen(false)}
      />
      <div className={open ? "mobileMenu open" : "mobileMenu"}>
        <button
          className="closeBtn"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <div className="mobileLinks">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mobileUser">
          {currentUser ? (
            isShopOrAdmin ? (
              <Link
                to="/profile"
                className="userChip"
                onClick={() => setOpen(false)}
              >
                <img src={currentUser?.avatar || defaultAvatar} alt="" />
                <span className="userName">{currentUser?.username}</span>
                {number > 0 && (
                  <span className="notifBadge">
                    {number > 9 ? "9+" : number}
                  </span>
                )}
              </Link>
            ) : (
              <button className="logoutBtnNav" onClick={handleLogout}>
                <img src={currentUser?.avatar || defaultAvatar} alt="" />
                <span>Çıkış Yap</span>
              </button>
            )
          ) : (
            <Link
              to="/login"
              className="loginCta"
              onClick={() => setOpen(false)}
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
