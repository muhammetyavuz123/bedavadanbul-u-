import { useContext, useMemo, useState } from "react";
import "./list.scss";
import Card from "../card/Card";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiEdit2, FiTrash2, FiInbox } from "react-icons/fi";

function List({ posts }) {
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [activeTab, setActiveTab] = useState("all");

  // DELETE
  const handleDelete = async (item) => {
    try {
      const deleted = await apiRequest.delete(`/posts/${item.id || item._id}`);

      if (deleted.status === 200) {
        window.location.reload();
      }
    } catch (err) {
      console.log("delete error", err);
    }
  };

  // APPROVE
  const handleConfirm = async (item) => {
    try {
      const res = await apiRequest.put(`/posts/${item.id || item._id}/approve`);

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (err) {
      console.log("approve error", err);
    }
  };

  // TAB FILTER
  const filteredPosts = useMemo(() => {
    if (!posts?.data) return [];

    if (activeTab === "pending") {
      return posts.data.filter((item) => !item.approved);
    }

    if (activeTab === "approved") {
      return posts.data.filter((item) => item.approved);
    }

    return posts.data;
  }, [posts, activeTab]);

  return (
    <>
      {/* TABS */}
      {currentUser?.role === "admin" && (
        <div className="adminTabs">
          <button
            className={`tabBtn all ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tüm İlanlar ({posts?.data?.length || 0})
          </button>

          <button
            className={`tabBtn pending ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Onay Bekleyen (
            {posts?.data?.filter((item) => !item.approved).length || 0})
          </button>

          <button
            className={`tabBtn approved ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Yayındaki İlanlar (
            {posts?.data?.filter((item) => item.approved).length || 0})
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="list">
        {filteredPosts?.map((item) => {
          const remainingDays = item.expireDate
            ? Math.ceil(
                (new Date(item.expireDate) - new Date()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;

          const isExpired =
            item.expireDate && new Date(item.expireDate) < new Date();

          return (
            <div key={item.id || item._id} className="listItem">
              <Card item={item} />

              {/* ADMIN INFO */}
              {currentUser?.role === "admin" && (
                <div className="adminInfoBox">
                  <span className="infoRow">
                    Durum:
                    <strong className={item.approved ? "ok" : "warn"}>
                      {item.approved ? "Onaylandı" : "Onay Bekliyor"}
                    </strong>
                  </span>

                  <span className="infoRow">
                    İlan Tipi:
                    <strong className="cap">{item.listingType}</strong>
                  </span>

                  <span className="infoRow">
                    Reklam Süresi:
                    <strong>{item.adDuration} Ay</strong>
                  </span>

                  {item.startDate && (
                    <span className="infoRow">
                      Başlangıç:
                      <strong>
                        {new Date(item.startDate).toLocaleDateString("tr-TR")}
                      </strong>
                    </span>
                  )}

                  {item.expireDate && (
                    <>
                      <span className="infoRow">
                        Bitiş Tarihi:
                        <strong>
                          {new Date(item.expireDate).toLocaleDateString(
                            "tr-TR",
                          )}
                        </strong>
                      </span>

                      <span className="infoRow">
                        Kalan Gün:
                        <strong
                          className={
                            isExpired
                              ? "danger"
                              : remainingDays <= 7
                                ? "warn"
                                : "ok"
                          }
                        >
                          {isExpired ? "Süresi Doldu" : `${remainingDays} gün`}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* BUTTONS */}
              <div className="actionsRow">
                {/* APPROVE */}
                {currentUser?.role === "admin" && !item.approved && (
                  <button
                    className="actionBtn approve"
                    onClick={() => handleConfirm(item)}
                  >
                    <FiCheckCircle /> Onayla
                  </button>
                )}

                {/* EDIT */}
                <button
                  className="actionBtn edit"
                  onClick={() => navigate(`/edit/${item.id || item._id}`)}
                >
                  <FiEdit2 /> Düzenle
                </button>

                {/* DELETE */}
                <button
                  className="actionBtn delete"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowPopup(true);
                  }}
                >
                  <FiTrash2 /> Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {filteredPosts?.length === 0 && (
        <div className="emptyState">
          <FiInbox className="emptyIcon" />
          <p>İlan bulunamadı.</p>
        </div>
      )}

      {/* DELETE POPUP */}
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onConfirm={() => {
          handleDelete(selectedItem);
          setShowPopup(false);
        }}
        title="İlan Sil"
        message="Bu ilanı silmek istediğine emin misin?"
        confirmText="Evet"
        cancelText="Hayır"
      />
    </>
  );
}

export default List;
