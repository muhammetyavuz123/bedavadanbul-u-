import { useEffect, useState, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./commentList.scss";
import Popup from "../Popup/Popup";
import { useError } from "../../context/ErrorContext";

const CommentLists = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const { showError } = useError();

  const loadComments = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await apiRequest.get(`/comments/${postId}`);

      setComments(res.data);
      // setPage((prev) => prev + 1);
    } catch (err) {
      showError(
        "Veri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!showPopup) return;

    try {
      const res = await apiRequest.delete(`/comments/${commentId}`, {
        credentials: "include",
      });

      const data = await res.data;

      if (res.status === 200) {
        setComments([]);
        setHasMore(true);
        loadComments();
        setShowPopup(false);
      } else {
        alert(data.message || "Silme işlemi başarısız.");
      }
    } catch (err) {
      showError(
        "Silme İşlemi yaparken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ya da kendi default icon'un
  return (
    <div className="comment-list">
      <h4>Yorumlar</h4>

      {comments.length === 0 && <p className="no-comments">Henüz yorum yok.</p>}

      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <div className="comment-top">
            <div className="left">
              <img
                src={comment.user?.avatar || defaultAvatar}
                alt="avatar"
                className="avatar"
              />
              <span className="username">{comment.user?.username}</span>
            </div>

            {currentUser?.id === comment.userId && (
              <>
                {" "}
                <button
                  className="delete-button"
                  onClick={() => setShowPopup(true)}
                >
                  Sil
                </button>
                <Popup
                  isOpen={showPopup}
                  onClose={() => setShowPopup(false)}
                  onConfirm={() => handleDelete(comment.id)}
                  title="Onay"
                  message="Yorumu silmek istediğinize emin misiniz?"
                  confirmText="Evet"
                  cancelText="Hayır"
                />
              </>
            )}
          </div>

          <p className="comment-content">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentLists;
