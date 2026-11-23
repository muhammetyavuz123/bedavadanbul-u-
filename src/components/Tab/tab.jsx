import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import AdminReports from "../AdminReports/AdminReports";
import AdminMisses from "../AdminMisses/AdminMisses";
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
  FiFlag,
  FiSearch,
} from "react-icons/fi";

// group: yan menüde başlık olarak görünür (masaüstü). desc: sayfanın üstünde
// "şu an neredeyim" bilgisi olarak görünür (özellikle mobilde işe yarar).
const MENU_ITEMS = [
  {
    key: "home",
    label: "Özet",
    icon: FiHome,
    group: "Genel",
    desc: "Hesabınızın genel görünümü ve hızlı işlemler",
  },
  {
    key: "profilList",
    label: "Kampanyalarım",
    labelAdmin: "Kampanyalar",
    icon: FiList,
    group: "Kampanyalar",
    desc: "Yayındaki ve onay bekleyen kampanyalarınız",
    descAdmin: "Tüm kampanyalar, onay ve yönetim",
  },
  {
    key: "newPost",
    label: "Kampanya Ekle",
    icon: FiPlusCircle,
    group: "Kampanyalar",
    desc: "Fiyat, indirim ve süreyi yazın; şehrinizdeki herkes görsün",
  },
  {
    key: "newCategories",
    label: "Kategori Ekle",
    icon: FiFolderPlus,
    group: "Kampanyalar",
    desc: "Listede olmayan bir kategori önerin",
  },
  {
    key: "business",
    label: "İşletme Paneli",
    icon: FiBriefcase,
    businessOnly: true,
    group: "İşletmem",
    desc: "İşletme profiliniz, gelen sorular ve sadakat kartı",
  },
  {
    key: "businessStats",
    label: "İstatistik",
    icon: FiBarChart2,
    businessOnly: true,
    group: "İşletmem",
    desc: "Müşteriler profilinizle nasıl etkileşime giriyor?",
  },
  {
    key: "businessShare",
    label: "QR & Paylaşım",
    icon: FiShare2,
    businessOnly: true,
    group: "İşletmem",
    desc: "Vitrin afişi, QR kod ve paylaşım bağlantısı",
  },
  {
    key: "profile",
    label: "Profil",
    icon: FiUser,
    group: "Hesap",
    desc: "Kullanıcı adı, e-posta, şifre ve profil fotoğrafı",
  },
  {
    key: "contact",
    label: "İletişim",
    icon: FiMail,
    adminOnly: true,
    group: "Yönetim",
    desc: "Gelen iletişim mesajları",
  },
  {
    key: "categories",
    label: "Kategoriler",
    icon: FiGrid,
    adminOnly: true,
    group: "Yönetim",
    desc: "Kategori ağacını düzenleyin",
  },
  {
    key: "adminBusinesses",
    label: "İşletmeler",
    icon: FiBriefcase,
    adminOnly: true,
    group: "Yönetim",
    desc: "İşletme başvuruları ve yayın durumu",
  },
  {
    key: "adminReports",
    label: "Şikâyetler",
    icon: FiFlag,
    adminOnly: true,
    group: "Yönetim",
    desc: "Kullanıcı şikâyetleri",
  },
  {
    key: "adminMisses",
    label: "Bulunamayan Aramalar",
    icon: FiSearch,
    adminOnly: true,
    group: "Yönetim",
    desc: "Sonuç çıkmayan aramalar",
  },
];

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const { updateUser, currentUser } = useContext(AuthContext);
  const isBusiness = currentUser?.role === "business";
  const isAdmin = currentUser?.role === "admin";

  const items = useMemo(
    () =>
      MENU_ITEMS.filter(
        (item) =>
          (!item.adminOnly || isAdmin) && (!item.businessOnly || isBusiness),
      ),
    [isAdmin, isBusiness],
  );

  // Menü başlıklarına göre gruplandır (sıra korunur)
  const groups = useMemo(() => {
    const out = [];
    items.forEach((item) => {
      let g = out.find((x) => x.name === item.group);
      if (!g) {
        g = { name: item.group, items: [] };
        out.push(g);
      }
      g.items.push(item);
    });
    return out;
  }, [items]);

  // /profile?tab=business gibi doğrudan bir sekmeye link verilebilir
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get("tab");
    return items.some((i) => i.key === requested) ? requested : "home";
  });
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const mainRef = useRef(null);
  const navRef = useRef(null);
  const firstRun = useRef(true);
  const [fade, setFade] = useState({ left: false, right: false });

  // Mobilde yatay menünün sağ/sol kenarında "devamı var" gölgesi
  const updateFade = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const left = nav.scrollLeft > 4;
    const right = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4;
    setFade((f) => (f.left === left && f.right === right ? f : { left, right }));
  }, []);

  useEffect(() => {
    updateFade();
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
  }, [updateFade, items.length]);

  useEffect(() => {
    // 1) Seçili sekme yatay menüde görünür/ortalı kalsın
    const nav = navRef.current;
    const btn = nav?.querySelector(".navItem.active");
    if (nav && btn && nav.scrollWidth > nav.clientWidth + 4) {
      nav.scrollTo({
        left: btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2,
        behavior: firstRun.current ? "auto" : "smooth",
      });
    }

    // 2) Sekme değişince içerik görünür alana gelsin: mobilde form menünün
    //    altında kalıp "hiçbir şey olmadı" izlenimi vermesin.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const el = mainRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const current = items.find((i) => i.key === activeTab) || items[0];
  const CurrentIcon = current?.icon;
  const titleOf = (item) =>
    item.key === "profilList" && isAdmin ? item.labelAdmin : item.label;
  const descOf = (item) =>
    item.key === "profilList" && isAdmin ? item.descAdmin : item.desc;

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={setActiveTab} />;
      case "profilList":
        return <ProfilList onAdd={() => setActiveTab("newPost")} />;
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
      case "adminReports":
        return <AdminReports />;
      case "adminMisses":
        return <AdminMisses />;
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
        <aside className="panelSide">
          <div className="panelUser">
            <span className="panelAvatar">
              <img
                src={
                  currentUser?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profil"
              />
            </span>
            <div className="panelUserInfo">
              <span className="panelUserName">{currentUser?.username}</span>
              <span className="panelUserRole">
                {isAdmin ? "Yönetici" : "Esnaf"}
              </span>
            </div>
          </div>

          <div
            className={`panelNavWrap${fade.left ? " fadeLeft" : ""}${fade.right ? " fadeRight" : ""}`}
          >
            <nav
              className="panelNav"
              ref={navRef}
              onScroll={updateFade}
              aria-label="Panel menüsü"
            >
              {groups.map((group) => (
                <div className="navGroup" key={group.name}>
                  <span className="navGroupLabel">{group.name}</span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        className={`navItem${active ? " active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setActiveTab(item.key)}
                      >
                        <span className="navIco">
                          <Icon />
                        </span>
                        <span className="navText">{titleOf(item)}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="navGroup navGroupLogout">
                <button
                  type="button"
                  className="navItem logoutBtn"
                  onClick={() => setShowPopup(true)}
                >
                  <span className="navIco">
                    <FiLogOut />
                  </span>
                  <span className="navText">Çıkış</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        <main className="panelMain" ref={mainRef}>
          {current && (
            <header className="panelHead">
              <span className="headIcon">
                <CurrentIcon />
              </span>
              <div className="headText">
                <h1>{titleOf(current)}</h1>
                <p>{descOf(current)}</p>
              </div>
            </header>
          )}
          <div className="panelBody" key={activeTab}>
            {renderContent()}
          </div>
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
