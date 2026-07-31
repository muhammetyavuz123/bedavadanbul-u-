import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import DOMPurify from "dompurify";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import CommentForms from "../../components/Comment/CommentForms";
import CommentLists from "../../components/Comment/CommentLists";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import {
  FiBookmark,
  FiMessageCircle,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiPhone,
  FiTag,
  FiPercent,
} from "react-icons/fi";

function SinglePage() {
  const post = useLoaderData();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [saved, setSaved] = useState(post.isSaved);

  const [refresh, setRefresh] = useState(false);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleSave = async () => {
    if (!currentUser) return navigate("/login");
    setSaved((p) => !p);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch {
      setSaved((p) => !p);
    }
  };

  const handleWhatsapp = () => {
    const phoneNumber = post.phoneNumber;
    if (!phoneNumber) {
      alert("Telefon numarası bulunamadı.");
      return;
    }

    const campaignTitle = post.title;
    const city = post.city;
    const discount = post.postDetail?.discountAmount || "bilinmiyor";
    const appLink = "https://bedavadabul.com";

    const message = encodeURIComponent(
      `Merhaba! 🎉\n\nSizin "${campaignTitle}" kampanyanızı ${city} şehrinde gördüm.\nİndirim: ${discount}\n\nBedavadabul.com uygulamasında paylaşmak istiyorum.\nUygulama linki: ${appLink}\n\nİlgilenirseniz birlikte tanıtım yapabiliriz.`,
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const startDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("tr-TR")
    : null;
  const endDate = post.expireDate
    ? new Date(post.expireDate).toLocaleDateString("tr-TR")
    : null;
  const discount = post.postDetail?.discountAmount;

  return (
    <>
      <Breadcrumb
        title="Kampanya Detay"
        breadcrumbText={`Anasayfa / ${post.title}`}
        backgroundImage={BreadcrumbImage}
      />

      <div className="singlePage">
        <div className="pageGrid">
          {/* 🔹 SOL SÜTUN */}
          <div className="mainCol">
            <div className="galleryCard">
              <Slider images={post.images} />

              {post?.listingType && post.listingType !== "standard" && (
                <span className={`typeBadge ${post.listingType}`}>
                  {post.listingType === "doping" ? "Doping" : "Vitrin"}
                </span>
              )}
            </div>

            <div className="headerCard">
              <div className="chipsRow">
                {post.category?.name && (
                  <span className="chip categoryChip">
                    <FiTag /> {post.category.name}
                  </span>
                )}
                {discount && (
                  <span className="chip discountChip">
                    <FiPercent /> {discount} İndirim
                  </span>
                )}
              </div>

              <h1>{post.title}</h1>

              <div className="address">
                <FiMapPin /> {post.address}
              </div>

              <div className="metaRow">
                <span>
                  <FiMapPin /> {post.city} / {post.district}
                </span>
              </div>
            </div>

            <div className="description">
              <h4>Açıklama</h4>
              <div
                className="descText"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.postDetail.desc),
                }}
              />
            </div>

            <div className="comments">
              {currentUser && (
                <CommentForms
                  postId={post.id}
                  userId={currentUser?.id}
                  onCommentAdded={() => setRefresh((p) => !p)}
                />
              )}
              <CommentLists postId={post.id} key={refresh} />
            </div>
          </div>

          {/* 🔹 SAĞ SÜTUN (STICKY) */}
          <aside className="sideCol">
            <div className="ctaCard">
              <div className="sellerRow">
                <img src={post.user.avatar || defaultAvatar} alt="user" />
                <div className="sellerInfo">
                  <span className="sellerName">{post.user.username}</span>
                  <span className="sellerRole">İşletme</span>
                </div>
              </div>

              <div className="factsList">
                <div className="factItem">
                  <span className="factLabel">
                    <FiTag /> Kategori
                  </span>
                  <strong>{post.category?.name || "-"}</strong>
                </div>
                <div className="factItem">
                  <span className="factLabel">
                    <FiPhone /> Telefon
                  </span>
                  <strong>{post.phoneNumber || "-"}</strong>
                </div>
                {startDate && (
                  <div className="factItem">
                    <span className="factLabel">
                      <FiClock /> Başlangıç
                    </span>
                    <strong>{startDate}</strong>
                  </div>
                )}
                <div className="factItem">
                  <span className="factLabel">
                    <FiCalendar /> Bitiş
                  </span>
                  <strong>{endDate || "Henüz onaylanmadı"}</strong>
                </div>
                {discount && (
                  <div className="factItem">
                    <span className="factLabel">
                      <FiPercent /> İndirim
                    </span>
                    <strong>{discount}</strong>
                  </div>
                )}
              </div>

              <button onClick={handleWhatsapp} className="messageBtn">
                <FiMessageCircle />
                WhatsApp ile Gönder
              </button>

              <button
                onClick={handleSave}
                className={`saveBtn ${saved ? "active" : ""}`}
              >
                <FiBookmark />
                {saved ? "Kaydedildi" : "Kaydet"}
              </button>

              <div className="mapBox">
                <Map items={[post]} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default SinglePage;
