import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CommentList from "../../components/Comment/CommentList";
import Form from "../../components/Comment/Form";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };
  const handleCommentAdded = () => {
    setRefresh((prev) => !prev);
  };
  const backgroundImage =
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8";

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ya da kendi default icon'un

  return (
    <>
      <Breadcrumb
        title="Kampanya"
        breadcrumbText="Anasayfa / Kampanya"
        backgroundImage={backgroundImage}
      />
      <div className="singlePage">
        <div className="details">
          <div className="wrapper">
            <Slider images={post.images} />
            <div className="info">
              <div className="top">
                <div className="post">
                  <h1>{post.title}</h1>
                  <div className="address">
                    <img src="/pin.png" alt="" />
                    <span>{post.address}</span>
                  </div>
                  <div className="price"> {post.price} ₺</div>
                </div>
                <div className="user">
                  <img src={post.user.avatar || defaultAvatar} alt="" />
                  <span>{post.user.username}</span>
                </div>
              </div>
              <h3 style={{ marginTop: "25px" }}>Açıklama</h3>
              <div
                className="bottom"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.postDetail.desc),
                }}
              ></div>
            </div>
          </div>
          <div className="commentDesktop">
            <div>
              {currentUser && (
                <Form
                  postId={post.id}
                  userId={currentUser.id}
                  onCommentAdded={handleCommentAdded}
                />
              )}

              <CommentList postId={post.id} key={refresh} />
            </div>
          </div>
        </div>
        <div className="features">
          <div className="wrapper">
            <p className="title">Genel Bilgiler</p>
            <div className="listVertical">
              <div className="feature">
                <img src="/history.png" alt="" />
                <div className="featureText">
                  <span>Kampanya Tarih : </span>
                  {post?.createdAt.split("T")[0]}
                </div>
              </div>
              <div className="feature">
                <img src="/history.png" alt="" />
                <div className="featureText">
                  <span>Kampanya Bitiş Tarih : </span>
                  {post?.postDetail?.campaignDuration?.split("T")[0]}
                </div>
              </div>
              <div className="feature">
                <img src="/pin.png" alt="" />
                <div className="featureText">
                  <span>Şehir: </span>
                  {post?.city}
                </div>
              </div>
              <div className="feature">
                <img src="/pin.png" alt="" />
                <div className="featureText">
                  <span>İlçe: </span>
                  {post?.district}
                </div>
              </div>
              <div className="feature">
                <img src="/discount.png" alt="" />
                <div className="featureText">
                  <span>İndirim: </span>
                  {post?.postDetail?.discountAmount}
                </div>
              </div>
            </div>
            <p className="title">Kategori</p>
            <div className="sizes">
              <div className="size">
                <img src="/select.png" alt="" />
                <span>{post?.type} </span>
              </div>
              {/* <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div> */}
            </div>

            <p className="title">Konum</p>
            <div className="mapContainer">
              <Map items={[post]} />
            </div>
            {/* <div className="buttons">
            <button>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#ff3c38" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div> */}
          </div>
        </div>
        <div className="commentMobil">
          <div>
            {currentUser && (
              <Form
                postId={post.id}
                userId={currentUser.id}
                onCommentAdded={handleCommentAdded}
              />
            )}

            <CommentList postId={post.id} key={refresh} />
          </div>
        </div>
      </div>
    </>
  );
}

export default SinglePage;
