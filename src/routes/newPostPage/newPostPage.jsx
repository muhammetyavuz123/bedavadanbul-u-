import { useState, useEffect } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [citie, setCitie] = useState();
  const [districhs, setDistrichs] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    const newErrors = {};

    if (!inputs.title?.trim()) newErrors.title = "Kampanya başlığı boş olamaz";
    if (!inputs.price) newErrors.price = "Fiyat boş olamaz";
    if (!inputs.address?.trim()) newErrors.address = "Adres boş olamaz";
    if (!inputs.city) newErrors.city = "İl seçiniz";
    if (!inputs.district) newErrors.district = "İlçe seçiniz";
    if (!inputs.latitude?.trim()) newErrors.latitude = "Latitude boş olamaz";
    if (!inputs.longitude?.trim()) newErrors.longitude = "Longitude boş olamaz";
    if (!inputs.type) newErrors.type = "Kampanya türü seçiniz";
    if (!inputs.businessName?.trim())
      newErrors.businessName = "İşletme adı boş olamaz";
    if (!inputs.campaignDuration?.trim())
      newErrors.campaignDuration = "Kampanya süresi boş olamaz";
    if (!inputs.discountAmount?.trim())
      newErrors.discountAmount = "İndirim miktarı boş olamaz";
    if (!inputs.phoneNumber?.trim())
      newErrors.phoneNumber = "Telefon numarası boş olamaz";
    if (!value?.trim()) newErrors.desc = "Açıklama boş olamaz";

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({}); // Hata yoksa temizle
    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: inputs.city,
          district: inputs.district,
          // bedroom: parseInt(inputs.bedroom),
          // bathroom: parseInt(inputs.bathroom),
          type: inputs.type,
          businessName: inputs.businessName, //işletme adı
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          phoneNumber: inputs.phoneNumber,
          images: images,
          approved: false,
        },
        postDetail: {
          desc: value,
          campaignDuration: inputs.campaignDuration, //kampanya süresi
          discountAmount: inputs.discountAmount, //indirim mikrayı
          // income: inputs.income,
          // size: parseInt(inputs.size),
          // school: parseInt(inputs.school),
          // bus: parseInt(inputs.bus),
          // restaurant: parseInt(inputs.restaurant),
        },
      });
      navigate("/" + res.data.id);
    } catch (err) {
      console.log(err);
      setError({ submit: "Sunucu hatası, lütfen tekrar deneyiniz." });
    }
  };
  useEffect(() => {
    async function citiesCall() {
      try {
        const cities = await apiRequest.get("/locations");
        setCities(cities.data);
      } catch (error) {
        console.log("🚀 ~ SearchBar ~ error:", error);
      }
    }
    citiesCall();
  }, []);

  useEffect(() => {
    async function districhCall() {
      if (citie) {
        try {
          const cities = await apiRequest.get(`/locations/${citie}`);
          setDistrichs(cities.data);
        } catch (error) {
          console.log("🚀 ~ SearchBar ~ error:", error);
        }
      }
    }

    districhCall();
  }, [citie]);
  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Yeni Kampanya Ekle</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Kampanya Başlığı</label>
              <input id="title" name="title" type="text" />
              {error.title && <span className="error">{error.title}</span>}
            </div>
            <div className="item">
              <label htmlFor="price">Fiyat</label>
              <input id="price" name="price" type="number" />
              {error.price && <span className="error">{error.price}</span>}
            </div>
            <div className="item">
              <label htmlFor="address">Adres</label>
              <input id="address" name="address" type="text" />
              {error.address && <span className="error">{error.address}</span>}
            </div>
            <div className="item">
              <label htmlFor="city">İl</label>
              <select
                id="city"
                name="city"
                type="text"
                placeholder="City"
                onChange={(e) => setCitie(e.target.value)}
              >
                <option value="">İl Seçiniz</option>
                {cities.length > 0 &&
                  cities?.map((city, index) => (
                    <option key={index} value={city?.il_adi}>
                      {city?.il_adi}
                    </option>
                  ))}
              </select>
              {error.city && <span className="error">{error.city}</span>}
            </div>
            <div className="item">
              <label htmlFor="district">İlçe</label>
              <select id="district" name="district" type="text">
                <option value="">İlçe Seçiniz</option>
                {districhs.length > 0 &&
                  districhs?.map((districh, index) => (
                    <option key={index} value={districh?.ilce_adi}>
                      {districh?.ilce_adi}
                    </option>
                  ))}
              </select>
              {error.district && (
                <span className="error">{error.district}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="text" />
              {error.latitude && (
                <span className="error">{error.latitude}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="text" />
              {error.longitude && (
                <span className="error">{error.longitude}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="type">Kampanya Türü</label>
              <select id="type" name="type" type="text" placeholder="Kampanya">
                <option value="">Kampanya Seçiniz</option>
                <option value="egitim">Eğitim / Okul</option>
                <option value="market">Market / Gıda</option>
                <option value="saglik">Sağlık & Kişisel Bakım</option>
                <option value="giyim">Giyim & Aksesuar</option>
                <option value="ev">Ev & Yaşam</option>
                <option value="bebek">Bebek & Çocuk</option>
                <option value="teknoloji">Teknoloji / Elektronik</option>
                <option value="otomotiv">Otomotiv & Aksesuar</option>
                <option value="seyahat">Seyahat & Outdoor</option>
                <option value="spor">Spor & Hobi</option>
                <option value="evcil">Evcil Hayvan</option>
                <option value="ofis">Ofis & Kırtasiye</option>
              </select>
              {error.type && <span className="error">{error.type}</span>}
            </div>
            <div className="item">
              <label htmlFor="businessName">İşletme Adı</label>
              <input
                min={1}
                id="businessName"
                name="businessName"
                type="text"
              />
              {error.businessName && (
                <span className="error">{error.businessName}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="campaignDuration">Kampanya Süresi</label>
              <input
                min={1}
                id="campaignDuration"
                name="campaignDuration"
                type="text"
              />
              {error.campaignDuration && (
                <span className="error">{error.campaignDuration}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="discountAmount">İndirim Miktarı</label>
              <input
                min={1}
                id="discountAmount"
                name="discountAmount"
                type="text"
              />
              {error.discountAmount && (
                <span className="error">{error.discountAmount}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="discountAmount">Telefon Numarsı</label>
              <input min={1} id="phoneNumber" name="phoneNumber" type="text" />
              {error.phoneNumber && (
                <span className="error">{error.phoneNumber}</span>
              )}
            </div>
            {error && <span>error</span>}
            <div className="item description">
              <label htmlFor="desc">Açıklama</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
              {error.desc && <span className="error">{error.desc}</span>}
            </div>
            <div className="uploadMobileWrapper">
              <UploadWidget
                uwConfig={{
                  multiple: true,
                  cloudName: "lamadev",
                  uploadPreset: "estate",
                  folder: "posts",
                }}
                setState={setImages}
              />
              <div className="imageGrid">
                {images.map((image, index) => (
                  <div className="imageItem" key={index}>
                    <img src={image.url || image} alt={`upload-${index}`} />
                  </div>
                ))}
              </div>
            </div>
            <button className="sendButton">Ekle</button>
            {error.submit && <span className="error">{error.submit}</span>}
          </form>
        </div>
      </div>
      <div className="sideContainer">
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "lamadev",
            uploadPreset: "estate",
            folder: "posts",
          }}
          setState={setImages}
        />
        <div className="imageGrid">
          {images.map((image, index) => (
            <div className="imageItem" key={index}>
              <img src={image.url || image} alt={`upload-${index}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewPostPage;
