import { useContext, useState } from "react";
import "./list.scss";
import Card from "../card/Card";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import Popup from "../Popup/Popup";

function List({ posts }) {
  const { currentUser } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);

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
            <button onClick={() => setShowPopup(true)}>Sil</button>
            {currentUser.role === "admin" && (
              <button onClick={() => handleConfirm(item)}>Onayla</button>
            )}
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
