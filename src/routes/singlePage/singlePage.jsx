import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import CommentForms from "../../components/Comment/CommentForms";
import CommentLists from "../../components/Comment/CommentLists";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BusinessLinkCard from "../../components/BusinessLinkCard/BusinessLinkCard";
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
  FiCheckCircle,
} from "react-icons/fi";

function SinglePage() {
  const post = useLoaderData();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [saved, setSaved] = useState(post.isSaved);

  const [refresh, setRefresh] = useState(false);

  // "Kampanyayı kullandım" (kullanıcı beyanı): sayaç + işaretleme
  const [redeem, setRedeem] = useState({ count: 0, redeemed: false });
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");
  const isLive =
    post.approved !== false && !!post.expireDate && new Date(post.expireDate) > new Date();

  useEffect(() => {
    let cancelled = false;
    apiRequest
      .get(`/posts/${post.id}/redemption`)
      .then((res) => !cancelled && setRedeem(res.data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [post.id, currentUser?.id]);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const toggleRedeem = async () => {
    if (!currentUser) return navigate("/login");
    setRedeemBusy(true);
    setRedeemMsg("");
    try {
      const res = redeem.redeemed
        ? await apiRequest.delete(`/posts/${post.id}/redeem`)
        : await apiRequest.post(`/posts/${post.id}/redeem`);
      setRedeem({ count: res.data.count, redeemed: res.data.redeemed });
    } catch (err) {
      setRedeemMsg(err.response?.data?.message || "İşlem yapılamadı.");
    } finally {
      setRedeemBusy(false);
    }
  };

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

  const plainDesc = (post.postDetail?.desc || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return (
    <>
      <Helmet>
        <title>
          {post.title} | {post.city} {post.district} - BedavadanBul.com
        </title>
        <meta
          name="description"
          content={
            plainDesc ||
            `${post.title} kampanyasını BedavadanBul.com'da incele, ${post.city} / ${post.district} bölgesindeki fırsatları kaçırma.`
          }
        />
      </Helmet>

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

              <BusinessLinkCard business={post.business} />

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

              {isLive && (
                <div className={`redeemBox ${redeem.redeemed ? "on" : ""}`}>
                  <div className="redeemInfo">
                    <FiCheckCircle />
                    <span>
                      {redeem.count > 0
                        ? `${redeem.count} kişi bu kampanyayı kullandığını belirtti`
                        : "Bu kampanyayı kullandıysanız belirtin"}
                    </span>
                  </div>
                  <button type="button" onClick={toggleRedeem} disabled={redeemBusy}>
                    {redeem.redeemed ? "Kullandım ✓ (geri al)" : "Kampanyayı kullandım"}
                  </button>
                  {redeemMsg && <p className="redeemErr">{redeemMsg}</p>}
                  {redeem.redeemed && post.business?.id && post.business.isActive && (
                    <Link className="redeemReview" to={`/isletme/${post.business.id}#reviews`}>
                      Deneyiminizi yorumlayın →
                    </Link>
                  )}
                </div>
              )}

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
