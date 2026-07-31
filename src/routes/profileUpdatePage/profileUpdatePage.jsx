import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [avatar, setAvatar] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    setError("");
    setSuccess("");

    try {
      setPending(true);

      const res = await apiRequest.put(`/users/${currentUser?.id}`, {
        username,
        email,
        // Boş şifre alanı gönderilmesin; backend zaten sadece doluysa hashliyor,
        // ama boş string göndermek yine de temiz değil.
        ...(password ? { password } : {}),
        ...(avatar[0] ? { avatar: avatar[0] } : {}),
      });

      updateUser(res.data);
      setSuccess("Profiliniz başarıyla güncellendi.");
      setTimeout(() => navigate("/profile"), 900);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="profileUpdatePage">
      <div className="updateCard">
        <div className="sideContainer">
          <span className="sideLabel">Profil Fotoğrafı</span>
          <div className="avatarWrapper">
            <img
              src={avatar[0] || currentUser?.avatar || "/noavatar.jpg"}
              alt="Profil fotoğrafı"
              className="avatar"
            />
          </div>
          <UploadWidget
            uwConfig={{
              cloudName: "difmqapnr",
              uploadPreset: "bedavadanbul",
              multiple: false,
              maxImageFileSize: 2000000,
              folder: "avatars",
            }}
            setState={setAvatar}
          />
          <p className="hint">JPG veya PNG, en fazla 2 MB</p>
        </div>

        <div className="formContainer">
          <h1>Profil Bilgileri</h1>
          <p className="subtitle">
            Hesap bilgilerinizi buradan güncelleyebilirsiniz.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="username">Kullanıcı Adı</label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={currentUser?.username}
                required
              />
            </div>

            <div className="item">
              <label htmlFor="email">E-posta</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser?.email}
                required
              />
            </div>

            <div className="item">
              <label htmlFor="password">Yeni Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                autoComplete="new-password"
              />
            </div>

            {error && <div className="formMessage error">{error}</div>}
            {success && <div className="formMessage success">{success}</div>}

            <button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
