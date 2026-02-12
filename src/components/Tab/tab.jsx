import React, { useState, useContext } from "react";
import "./tab.scss";

import NewPostPage from "../../routes/newPostPage/newPostPage";
import ProfileUpdatePage from "../../routes/profileUpdatePage/profileUpdatePage";
import ProfilList from "../../routes/profilList/profilList";

import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";
import MessagesPage from "../Contact/Contact";
import Dashboard from "../../routes/profilePage/dashboard";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("home");
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "profilList":
        return <ProfilList />;
      case "newPost":
        return <NewPostPage />;
      case "profile":
        return <ProfileUpdatePage />;

      case "contact":
        return <MessagesPage />;

      default:
        return <NewPostPage />;
    }
  };

  return (
    <>
      <div className="page-container-panel">
        <aside className="sidebarContent-panel">
          <div className="filter-group">
            <div className="sidebar">
              <h2>Menü</h2>
              <button onClick={() => setActiveTab("home")}>Ana Sayfa</button>
              <button onClick={() => setActiveTab("profilList")}>
                {currentUser?.user?.role === "admin"
                  ? "kampanyalar"
                  : "Kampanyalarım"}
              </button>
              <button onClick={() => setActiveTab("newPost")}>
                Kampanya Ekle
              </button>
              <button onClick={() => setActiveTab("profile")}>Profil</button>
              {currentUser?.user?.role === "admin" && (
                <button onClick={() => setActiveTab("contact")}>
                  İletişim
                </button>
              )}
              <button onClick={() => setShowPopup(true)}>Çıkış</button>
            </div>{" "}
          </div>
        </aside>

        <main className="content-panel">
          <div className="content">{renderContent()}</div>
        </main>
      </div>

      <div>
        <Popup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onConfirm={handleLogout}
          title="Onay"
          message="Çıkış yapmak istediğine emin misin?"
          confirmText="Çıkış Yap"
          cancelText="Vazgeç"
        />
      </div>
    </>
  );
}
