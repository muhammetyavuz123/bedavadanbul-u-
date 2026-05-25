import { useState, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useError } from "../../context/ErrorContext";

const CommentForms = ({ postId, userId, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { showError } = useError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await apiRequest.post("/comments", {
        postId,
        userId,
        content,
      });

      if (res.status === 201) {
        setContent("");
        if (onCommentAdded) onCommentAdded();
      } else {
        const err = await res.json();
        alert(err.message || "Yorum eklenemedi.");
      }
    } catch (error) {
      showError(
        "Yorum eklenien bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
    }
  };
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ya da kendi default icon'un

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <img
        src={currentUser?.avatar || defaultAvatar}
        alt="avatar"
        className="avatar"
      />
      <input
        type="text"
        placeholder="Yorumunuzu yazın..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {/* {currentUser ? (
        <Link to="/login"></Link>
      ) : ( */}
      <button type="submit">Gönder</button>
      {/* )} */}
    </form>
  );
};

export default CommentForms;
