import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "./newPostPage.scss";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useCategories } from "../../lib/useCategories";
import { getListingPrice } from "../../lib/pricing";
import PaymentModal from "../../components/PaymentModal/PaymentModal";
import Loader from "../../components/loader/Loader";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const categories = useCategories();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [value, setValue] = useState("");

  const [citie, setCitie] = useState("");
  const [district, setDistrict] = useState("");
  const [cities, setCities] = useState([]);
  const [districhs, setDistrichs] = useState([]);

  // Basit metin alanları (uncontrolled input + defaultValue). Bu alanlar
  // sadece ilan yüklendikten SONRA render edildiği için (bkz. `if (loading)`
  // aşağıda) defaultValue doğru şekilde ilk (ve tek) mount'ta set edilir.
  const [initialTitle, setInitialTitle] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [initialAddress, setInitialAddress] = useState("");
  const [initialBusinessName, setInitialBusinessName] = useState("");
  const [initialCampaignDuration, setInitialCampaignDuration] = useState("");
  const [initialDiscountAmount, setInitialDiscountAmount] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [listingType, setListingType] = useState("standard");
  const [adDuration, setAdDuration] = useState(""); // salt-okunur: oluşturmada belirlenir
  const [phoneNumber, setPhoneNumber] = useState("");
  const [images, setImages] = useState([]);

  const [error, setError] = useState({});
  const [pending, setPending] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingInputs, setPendingInputs] = useState(null);

  const currentPrice = getListingPrice(listingType, Number(adDuration || 0));

  // ✅ İLANI GETİR
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiRequest.get(`/posts/${id}`);
        const post = res.data;

        setInitialTitle(post.title || "");
        setInitialPrice(post.price ?? "");
        setInitialAddress(post.address || "");
        setInitialBusinessName(post.businessName || "");
        setInitialCampaignDuration(post.postDetail?.campaignDuration || "");
        setInitialDiscountAmount(post.postDetail?.discountAmount || "");
        setCitie(post.city || "");
        setDistrict(post.district || "");
        setCategoryId(post.categoryId || "");
        setListingType(post.listingType || "standard");
        setAdDuration(post.adDuration ? String(post.adDuration) : "");
        setPhoneNumber(post.phoneNumber || "");
        setImages(post.images || []);
        setValue(post.postDetail?.desc || "");
        setLoading(false);
      } catch (err) {
        console.log(err);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // şehirleri çek
  useEffect(() => {
    async function citiesCall() {
      try {
        const res = await apiRequest.get("/locations");
        setCities(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    citiesCall();
  }, []);

  // ilçe verisi
  useEffect(() => {
    async function districhCall() {
      if (citie) {
        try {
          const res = await apiRequest.get(`/locations/${citie}`);
          setDistrichs(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    }
    districhCall();
  }, [citie]);

  const removeImage = (url) => {
    setImages((prev) => prev.filter((img) => (img.url || img) !== url));
  };

  // ✅ FORM GÖNDER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    const newErrors = {};

    if (!inputs.title?.trim()) newErrors.title = "Başlık boş olamaz";
    if (!inputs.price) newErrors.price = "Fiyat boş olamaz";
    if (!inputs.address?.trim()) newErrors.address = "Adres boş olamaz";
    if (!citie) newErrors.city = "İl seçiniz";
    if (!district) newErrors.district = "İlçe seçiniz";
    if (!categoryId) newErrors.categoryId = "Kategori seçiniz";
    if (!inputs.businessName?.trim())
      newErrors.businessName = "İşletme adı boş olamaz";
    if (!phoneNumber?.trim())
      newErrors.phoneNumber = "Telefon numarası boş olamaz";
    if (!value?.trim()) newErrors.desc = "Açıklama boş olamaz";

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({});

    // 🔹 Vitrin/Doping her zaman ücretlidir (bkz. lib/pricing.js) — mevcut
    // ilanın yayın süresi değiştirilemediği için fiyat, ilan oluşturulurken
    // seçilmiş olan süre üzerinden hesaplanır.
    if (currentPrice > 0) {
      setPendingInputs(inputs);
      setShowPayment(true);
      return;
    }

    await saveChanges(inputs);
  };

  // ✅ GÜNCELLEMEYİ FİİLEN GÖNDEREN İSTEK
  const saveChanges = async (inputs) => {
    try {
      setPending(true);

      await apiRequest.put(`/posts/${id}`, {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: citie,
          district,
          categoryId,
          businessName: inputs.businessName,
          phoneNumber,
          images: images.map((img) => img.url || img),
          listingType,
        },
        postDetail: {
          desc: value,
          campaignDuration: inputs.campaignDuration,
          discountAmount: inputs.discountAmount,
        },
      });

      navigate("/" + id);
    } catch (err) {
      console.log(err);
      setError({
        submit: "Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.",
      });
    } finally {
      setPending(false);
      setShowPayment(false);
    }
  };

  if (loading) return <Loader />;

  if (notFound) {
    return (
      <div className="newPostPage">
        <div className="formContainer">
          <p className="error">İlan bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1 className="mainTitle">İlanı Güncelle</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="businessName">İşletme Adı</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                defaultValue={initialBusinessName}
              />
              {error.businessName && (
                <span className="error">{error.businessName}</span>
              )}
            </div>

            <div className="item">
              <label htmlFor="title">Başlık</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={initialTitle}
              />
              {error.title && <span className="error">{error.title}</span>}
            </div>

            <div className="item">
              <label htmlFor="city">İl</label>
              <select
                id="city"
                name="city"
                value={citie}
                onChange={(e) => {
                  setCitie(e.target.value);
                  setDistrict("");
                }}
              >
                <option value="">İl Seçiniz</option>
                {cities.map((c, index) => (
                  <option key={index} value={c.il_adi}>
                    {c.il_adi}
                  </option>
                ))}
              </select>
              {error.city && <span className="error">{error.city}</span>}
            </div>

            <div className="item">
              <label htmlFor="district">İlçe</label>
              <select
                id="district"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">İlçe Seçiniz</option>
                {districhs.map((d, index) => (
                  <option key={index} value={d.ilce_adi}>
                    {d.ilce_adi}
                  </option>
                ))}
              </select>
              {error.district && (
                <span className="error">{error.district}</span>
              )}
            </div>

            <div className="item">
              <label htmlFor="address">Adres</label>
              <input
                id="address"
                name="address"
                type="text"
                defaultValue={initialAddress}
              />
              {error.address && <span className="error">{error.address}</span>}
            </div>

            <div className="item">
              <label htmlFor="price">Fiyat</label>
              <input
                id="price"
                name="price"
                type="number"
                defaultValue={initialPrice}
              />
              {error.price && <span className="error">{error.price}</span>}
            </div>

            <div className="item">
              <label htmlFor="category">Kategori</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Kategori seç</option>
                {categories
                  .filter((c) => !c.parentId)
                  .map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>Tümü ({parent.name})</option>
                      {categories
                        .filter((c) => c.parentId === parent.id)
                        .map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
              {error.categoryId && (
                <span className="error">{error.categoryId}</span>
              )}
            </div>

            <div className="item listingTypePicker">
              <label>İlan Tipi</label>

              <div className="typeCards">
                <button
                  type="button"
                  className={`typeCard${listingType === "standard" ? " selected" : ""}`}
                  onClick={() => setListingType("standard")}
                >
                  <span className="badge free">Ücretsiz</span>
                  <h4>Standart İlan</h4>
                  <p>Kategori listesinde normal sırada yayınlanır.</p>
                </button>

                <button
                  type="button"
                  className={`typeCard${listingType === "featured" ? " selected" : ""}`}
                  onClick={() => setListingType("featured")}
                >
                  <span className="badge paid">Vitrin</span>
                  <h4>Vitrin İlan</h4>
                  <p>Kategori sayfasında öne çıkarılır, daha çok görüntülenir.</p>
                </button>

                <button
                  type="button"
                  className={`typeCard${listingType === "doping" ? " selected" : ""}`}
                  onClick={() => setListingType("doping")}
                >
                  <span className="badge paid">Doping</span>
                  <h4>Doping İlan</h4>
                  <p>En üstte, en yüksek görünürlükle yayınlanır.</p>
                </button>
              </div>

              {adDuration && (
                <div className="durationReadonly">
                  <span>
                    Yayın Süresi: <strong>{adDuration} Ay</strong>
                  </span>
                  <small>
                    (İlan oluşturulurken belirlenir, düzenlemede değiştirilemez)
                  </small>
                </div>
              )}

              {currentPrice > 0 && (
                <div className="priceSummary">
                  <span>Bu ilan tipiyle kaydetmek için ödeme gerekir</span>
                  <strong>{currentPrice.toLocaleString("tr-TR")} ₺</strong>
                </div>
              )}
            </div>

            <div className="item">
              <label htmlFor="phoneNumber">Telefon Numarası</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {error.phoneNumber && (
                <span className="error">{error.phoneNumber}</span>
              )}
            </div>

            <div className="item">
              <label htmlFor="campaignDuration">Kampanya Süresi</label>
              <input
                id="campaignDuration"
                name="campaignDuration"
                type="text"
                defaultValue={initialCampaignDuration}
              />
            </div>

            <div className="item">
              <label htmlFor="discountAmount">İndirim Miktarı</label>
              <input
                id="discountAmount"
                name="discountAmount"
                type="text"
                defaultValue={initialDiscountAmount}
              />
            </div>

            <div className="item description">
              <label htmlFor="desc">Açıklama</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
              {error.desc && <span className="error">{error.desc}</span>}
            </div>

            <div className="item">
              <label>Görseller</label>
              <div className="existingImages">
                {images.map((image, index) => {
                  const url = image.url || image;
                  return (
                    <div className="existingImageItem" key={index}>
                      <img src={url} alt={`gorsel-${index}`} />
                      <button
                        type="button"
                        className="removeImageBtn"
                        onClick={() => removeImage(url)}
                        aria-label="Görseli kaldır"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              <UploadWidget
                uwConfig={{
                  multiple: true,
                  cloudName: "difmqapnr",
                  uploadPreset: "bedavadanbul",
                  folder: "posts",
                }}
                setState={setImages}
              />
            </div>

            <button className="sendButton" disabled={pending}>
              {pending
                ? "Kaydediliyor..."
                : currentPrice > 0
                  ? `Ödemeye Geç · ${currentPrice.toLocaleString("tr-TR")} ₺`
                  : "Değişiklikleri Kaydet"}
            </button>{" "}
            {error.submit && <span className="error">{error.submit}</span>}
          </form>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          amount={currentPrice}
          listingType={listingType}
          duration={adDuration}
          onClose={() => setShowPayment(false)}
          onSuccess={() => saveChanges(pendingInputs)}
        />
      )}
    </div>
  );
}

export default EditPostPage;
