import React, { useState, useContext } from "react";
import "./tab.scss";

import NewPostPage from "../../routes/newPostPage/newPostPage";
import ProfileUpdatePage from "../../routes/profileUpdatePage/profileUpdatePage";
import ProfilList from "../../routes/profilList/profilList";

import apiRequest from "../../lib/apiRequest";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";
import MessagesPage from "../Contact/Contact";
import Dashboard from "../../routes/profilePage/dashboard";
import NewCategoriesPage from "../../routes/newCategoriesPage/newCategoriesPage";
import CategoriesPage from "../../routes/categoriesPage/categoriesPage";
import BusinessDashboard from "../../routes/businessDashboard/businessDashboard";
import BusinessStats from "../BusinessStats/BusinessStats";
import BusinessShare from "../BusinessShare/BusinessShare";
import AdminBusinesses from "../AdminBusinesses/AdminBusinesses";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiUser,
  FiFolderPlus,
  FiMail,
  FiGrid,
  FiLogOut,
  FiBriefcase,
  FiBarChart2,
  FiShare2,
} from "react-icons/fi";

const MENU_ITEMS = [
  { key: "home", label: "Ana Sayfa", icon: FiHome },
  { key: "profilList", label: "Kampanyalarım", labelAdmin: "Kampanyalar", icon: FiList },
  { key: "newPost", label: "Kampanya Ekle", icon: FiPlusCircle },
  { key: "business", label: "İşletme Paneli", icon: FiBriefcase, businessOnly: true },
  { key: "businessStats", label: "İstatistik", icon: FiBarChart2, businessOnly: true },
  { key: "businessShare", label: "QR & Paylaşım", icon: FiShare2, businessOnly: true },
  { key: "profile", label: "Profil", icon: FiUser },
  { key: "newCategories", label: "Kategori Ekle", icon: FiFolderPlus },
  { key: "contact", label: "İletişim", icon: FiMail, adminOnly: true },
  { key: "categories", label: "Kategoriler", icon: FiGrid, adminOnly: true },
  { key: "adminBusinesses", label: "İşletmeler", icon: FiBriefcase, adminOnly: true },
];

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const { updateUser, currentUser } = useContext(AuthContext);
  const isBusiness = currentUser?.role === "business";
  // /profile?tab=business gibi doğrudan bir sekmeye link verilebilir
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get("tab");
    const businessTabs = ["business", "businessStats", "businessShare"];
    if (isBusiness && businessTabs.includes(requested)) return requested;
    return "home";
  });
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const isAdmin = currentUser?.role === "admin";

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
      case "business":
        return <BusinessDashboard embedded />;
      case "businessStats":
        return <BusinessStats />;
      case "businessShare":
        return <BusinessShare />;
      case "adminBusinesses":
        return <AdminBusinesses />;
      case "profile":
        return <ProfileUpdatePage />;
      case "newCategories":
        return <NewCategoriesPage />;
      case "categories":
        return <CategoriesPage />;
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
          <div className="miniProfile">
            <img
              src={
                currentUser?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profil"
            />
            <div className="miniProfileInfo">
              <span className="miniProfileName">{currentUser?.username}</span>
              <span className="miniProfileRole">
                {isAdmin ? "Yönetici" : "Esnaf"}
              </span>
            </div>
          </div>

          <div className="filter-group">
            <div className="sidebar">
              {MENU_ITEMS.filter(
                (item) =>
                  (!item.adminOnly || isAdmin) &&
                  (!item.businessOnly || isBusiness),
              ).map(
                (item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      className={activeTab === item.key ? "active" : ""}
                      onClick={() => setActiveTab(item.key)}
                    >
                      <Icon className="menuIcon" />
                      <span>
                        {item.key === "profilList" && isAdmin
                          ? item.labelAdmin
                          : item.label}
                      </span>
                    </button>
                  );
                },
              )}
              <button className="logoutBtn" onClick={() => setShowPopup(true)}>
                <FiLogOut className="menuIcon" />
                <span>Çıkış</span>
              </button>
            </div>
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
