import { useContext, useState } from "react";
import "./list.scss";
import Card from "../card/Card";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";
import { useNavigate } from "react-router-dom";

function List({ posts }) {
  const { currentUser } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (item) => {
    try {
      const deleted = await apiRequest.delete(`/posts/${item.id}`);
      if (deleted.status === 200) {
        window.location.reload();
      }
    } catch (err) {
      console.log("deleteeee", err);
    }
  };
  const handleConfirm = async (item) => {
    try {
      const deleted = await apiRequest.put(`/posts/${item.id}/approve`);
      if (deleted.status === 200) {
        window.location.reload();
      }
    } catch (err) {
      console.log("güncellendi", err);
    }
  };
  return (
    <>
      {" "}
      <div className="list">
        {posts?.data?.map((item) => (
          <>
            <Card key={item.id} item={item} />
            <button className="buttonDelete" onClick={() => setShowPopup(true)}>
              Sil
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              {currentUser.user?.role === "admin" && (
                <button
                  className="buttonDelete"
                  onClick={() => handleConfirm(item)}
                >
                  Onayla
                </button>
              )}
              <button
                className="buttonDelete"
                onClick={() => navigate(`/edit/${item.id}`)}
              >
                Düzenle
              </button>
            </div>

            <div>
              <Popup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                onConfirm={() => handleDelete(item)}
                title="Onay"
                message="Silmek istediğine emin misin?"
                confirmText="Evet"
                cancelText="Hayır"
              />
            </div>
          </>
        ))}
      </div>
    </>
  );
}

export default List;
