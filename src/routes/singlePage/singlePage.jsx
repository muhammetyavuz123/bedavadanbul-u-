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

  return (
    <>
      <Breadcrumb
        title="Kampanya Detay"
        breadcrumbText={`Anasayfa / ${post.title}`}
        backgroundImage={BreadcrumbImage}
      />

      <div className="singlePage">
        <h2 style={{ borderBottom: "1px solid #ddd", paddingBottom: "15px" }}>
          {post.title}
        </h2>

        <div className="container">
          {/* 🔹 SLIDER + BİLGİLER */}
          <div className="topSection">
            <div className="sliderArea">
              <Slider images={post.images} />
            </div>

            <div className="infoArea">
              <h3>Genel Bilgiler</h3>
              <ul>
                <li>
                  <span>Kampanya Başlangıç:</span>{" "}
                  {post.createdAt.split("T")[0]}
                </li>
                <li>
                  <span>Bitiş Tarihi:</span>{" "}
                  {post.expireDate
                    ? new Date(post.expireDate).toLocaleDateString("tr-TR")
                    : "Henüz onaylanmadı"}{" "}
                </li>
                <li>
                  <span>Telefon:</span> {post.phoneNumber}
                </li>
                <li>
                  <span>Şehir:</span> {post.city}
                </li>
                <li>
                  <span>İlçe:</span> {post.district}
                </li>
                <li>
                  <span>İndirim:</span> {post.postDetail?.discountAmount}
                </li>
              </ul>

              <div className="mapBox">
                <Map items={[post]} />
              </div>
            </div>
          </div>

          {/* 🔹 BAŞLIK + KULLANICI */}
          <div className="titleSection">
            <div className="left">
              <h1>{post.title}</h1>
              <div className="address">{post.address}</div>
            </div>

            <div className="right">
              <div className="userBox">
                <img src={post.user.avatar || defaultAvatar} alt="user" />
                <span>{post.user.username}</span>
              </div>
              <div className="buttons">
                <button
                  onClick={() => {
                    const phoneNumber = post.phoneNumber; // "905XXXXXXXXX"
                    if (!phoneNumber) {
                      alert("Telefon numarası bulunamadı.");
                      return;
                    }

                    const campaignTitle = post.title;
                    const city = post.city;
                    const discount =
                      post.postDetail?.discountAmount || "bilinmiyor";
                    const appLink = "https://bedavadabul.com";

                    const message = encodeURIComponent(
                      `Merhaba! 🎉\n\nSizin "${campaignTitle}" kampanyanızı ${city} şehrinde gördüm.\nİndirim: ${discount}\n\nBedavadabul.com uygulamasında paylaşmak istiyorum.\nUygulama linki: ${appLink}\n\nİlgilenirseniz birlikte tanıtım yapabiliriz.`,
                    );

                    window.open(
                      `https://wa.me/${phoneNumber}?text=${message}`,
                      "_blank",
                    );
                  }}
                  className="messageBtn"
                >
                  <img src="/chat.png" alt="" />
                  WhatsApp ile Gönder
                </button>

                {/* <button
                onClick={handleSave}
                className={`saveBtn ${saved ? "active" : ""}`}
              >
                <img src="/save.png" alt="" />
                {saved ? "Kaydedildi" : "Kaydet"}
              </button> */}
              </div>
            </div>
          </div>

          {/* 🔹 KATEGORİLER */}
          <div className="categories">
            <h4>Kategori</h4>
            <div className="catItem">{post.category?.name}</div>
          </div>

          {/* 🔹 AÇIKLAMA */}
          <div className="description">
            <h4>Açıklama</h4>
            <div
              className="descText"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            />
          </div>

          {/* 🔹 YORUMLAR */}
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
      </div>
    </>
  );
}

export default SinglePage;
