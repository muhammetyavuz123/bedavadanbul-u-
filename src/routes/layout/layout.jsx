import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/Footer/Footer";
import FloatingContact from "../../components/FloatingContact/FloatingContact";
import ScrollToTop from "../../components/ScrollToTop";

// ⚠️ FIX: <ScrollToTop/> daha önce App.jsx'te <RouterProvider>'ın CHILD'ı
// olarak render ediliyordu. React Router v6.4+'ın data router API'sinde
// RouterProvider `children` prop'unu hiç render etmiyor — yani ScrollToTop
// aslında hiç mount olmuyordu, içindeki useLocation() hiç çalışmıyordu ve
// sayfa geçişlerinde scroll pozisyonu sıfırlanmıyordu (ör. /harita'ya
// gidince sayfa eski scroll konumunda açılıp direkt footer görünüyordu).
// Gerçekten Router ağacının içinde olan Layout/RequireAuth'a taşındı.
function Layout() {
  return (
    <div className="layout">
      <ScrollToTop />
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
        <Footer />
      </div>
      <FloatingContact />
    </div>
  );
}

function RequireAuth() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return <Navigate to="/login" />;
  else {
    return (
      <>
        {" "}
        <div className="layout">
          <ScrollToTop />
          <div className="navbar">
            <Navbar />
          </div>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </>
    );
  }
}

export { Layout, RequireAuth };
