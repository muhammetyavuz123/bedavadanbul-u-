import { useContext, useMemo, useState } from "react";
import "./list.scss";
import Card from "../card/Card";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";
import { useNavigate } from "react-router-dom";

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
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: activeTab === "all" ? "#ff3c38" : "#eee",
              color: activeTab === "all" ? "#fff" : "#333",
              fontWeight: "600",
            }}
          >
            Tüm İlanlar ({posts?.data?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: activeTab === "pending" ? "#ff9800" : "#eee",
              color: activeTab === "pending" ? "#fff" : "#333",
              fontWeight: "600",
            }}
          >
            Onay Bekleyen (
            {posts?.data?.filter((item) => !item.approved).length || 0})
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: activeTab === "approved" ? "#16a34a" : "#eee",
              color: activeTab === "approved" ? "#fff" : "#333",
              fontWeight: "600",
            }}
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
            <div
              key={item.id || item._id}
              style={{
                marginBottom: "25px",
                borderBottom: "1px solid #e5e5e5",
                paddingBottom: "25px",
              }}
            >
              <Card item={item} />

              {/* ADMIN INFO */}
              {currentUser?.role === "admin" && (
                <div
                  style={{
                    marginTop: "14px",
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "14px",
                    background: "#fafafa",
                    padding: "14px",
                    borderRadius: "12px",
                  }}
                >
                  <span>
                    Durum:
                    <strong
                      style={{
                        color: item.approved ? "#16a34a" : "#ff9800",
                        marginLeft: "6px",
                      }}
                    >
                      {item.approved ? "Onaylandı" : "Onay Bekliyor"}
                    </strong>
                  </span>

                  <span>
                    İlan Tipi:
                    <strong
                      style={{
                        marginLeft: "6px",
                        textTransform: "capitalize",
                      }}
                    >
                      {item.listingType}
                    </strong>
                  </span>

                  <span>
                    Reklam Süresi:
                    <strong style={{ marginLeft: "6px" }}>
                      {item.adDuration} Ay
                    </strong>
                  </span>

                  {item.startDate && (
                    <span>
                      Başlangıç:
                      <strong style={{ marginLeft: "6px" }}>
                        {new Date(item.startDate).toLocaleDateString("tr-TR")}
                      </strong>
                    </span>
                  )}

                  {item.expireDate && (
                    <>
                      <span>
                        Bitiş Tarihi:
                        <strong style={{ marginLeft: "6px" }}>
                          {new Date(item.expireDate).toLocaleDateString(
                            "tr-TR",
                          )}
                        </strong>
                      </span>

                      <span>
                        Kalan Gün:
                        <strong
                          style={{
                            marginLeft: "6px",
                            color: isExpired
                              ? "red"
                              : remainingDays <= 7
                                ? "#ff9800"
                                : "#16a34a",
                          }}
                        >
                          {isExpired ? "Süresi Doldu" : `${remainingDays} gün`}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {/* APPROVE */}
                {currentUser?.role === "admin" && !item.approved && (
                  <button
                    className="buttonDelete"
                    style={{
                      background: "#16a34a",
                      marginTop: "10px",
                    }}
                    onClick={() => handleConfirm(item)}
                  >
                    Onayla
                  </button>
                )}

                {/* EDIT */}
                <button
                  className="buttonDelete"
                  style={{
                    background: "#16a34a",
                    marginTop: "10px",
                  }}
                  onClick={() => navigate(`/edit/${item.id || item._id}`)}
                >
                  Düzenle
                </button>

                {/* DELETE */}
                {/* {currentUser?.user?.role === "admin" && ( */}
                <button
                  className="buttonDelete"
                  style={{
                    background: "#dc2626",
                    marginTop: "10px",
                  }}
                  onClick={() => {
                    setSelectedItem(item);
                    setShowPopup(true);
                  }}
                >
                  Sil
                </button>
                {/* )} */}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {filteredPosts?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            fontSize: "16px",
            color: "#777",
          }}
        >
          İlan bulunamadı.
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
