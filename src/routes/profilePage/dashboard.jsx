import { useContext, useEffect, useState } from "react";
import "./dashboard.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

export default function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await apiRequest.get(
          currentUser?.role === "admin"
            ? `/posts?approved=false` // admin onay bekleyenleri görebilir
            : `/posts?userId=${currentUser?.id}`, // normal kullanıcı kendi kampanyalarını görür
        );
        const campaignsArray = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setCampaigns(campaignsArray);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCampaigns();
  }, [currentUser]);

  // Statlar
  const activeCount = campaigns.filter((c) => c.approved === true).length;
  const pendingCount = campaigns.filter((c) => c.approved === false).length;
  const rejectedCount = campaigns.filter(
    (c) => c.approved === "rejected",
  ).length;

  // Son 5 kampanya
  const recentPosts = campaigns
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <h1>Profil Paneli</h1>

      <div className="profile-header">
        <div className="user-info">
          <img
            src={
              currentUser?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profil"
          />
          <div className="details">
            <span className="username">{currentUser?.username}</span>
            <span className="role">
              {currentUser?.role === "admin" ? "Yönetici" : "Esnaf"}
            </span>
            <span className="location">
              {currentUser?.city}, {currentUser?.district}
            </span>
          </div>
        </div>
        {/* <button className="edit-btn">Profili Düzenle</button> */}
      </div>

      <div className="stats">
        <div className="card active">
          <FiCheckCircle className="cardIcon" />
          <h3>Yayında Kampanyalar</h3>
          <p>{activeCount}</p>
        </div>
        <div className="card pending">
          <FiClock className="cardIcon" />
          <h3>Onay Bekleyenler</h3>
          <p>{pendingCount}</p>
        </div>
        <div className="card rejected">
          <FiXCircle className="cardIcon" />
          <h3>Reddedilenler</h3>
          <p>{rejectedCount}</p>
        </div>
      </div>

      <div className="recent-posts">
        <h2>Son Kampanyalar</h2>
        <div className="post-list">
          {recentPosts.length === 0 && <p>Henüz kampanya yok</p>}
          {recentPosts.map((post) => (
            <div key={post.id} className="post-item">
              <span className="title">{post.title}</span>
              <span
                className={`status ${
                  post.approved === true
                    ? "approved"
                    : post.approved === false
                      ? "pending"
                      : "rejected"
                }`}
              >
                {post.approved === true
                  ? "Onaylandı"
                  : post.approved === false
                    ? "Bekliyor"
                    : "Reddedildi"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
