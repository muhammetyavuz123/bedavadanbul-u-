import { useEffect, useState, useContext } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useError } from "../../context/ErrorContext";

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [citie, setCitie] = useState("");
  const [district, setDistrict] = useState("");
  const [districhs, setDistrichs] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [type, setType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { showError } = useError();

  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  console.log("🚀 ~ NewPostPage ~ currentUser:", currentUser);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showError("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));

        // Konum alındığında hata temizle
        setError((prev) => ({
          ...prev,
          latitude: "",
          longitude: "",
        }));

        setLoadingLocation(false);
      },
      (err) => {
        // 🔥 En önemli satır — konum alınmışsa error’u iptal et
        if (latitude && longitude) {
          setLoadingLocation(false);
          return;
        }

        let message = "Konum alınamadı.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            message =
              "Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Konum bilgisine erişilemedi.";
            break;
          case err.TIMEOUT:
            message = "Konum isteği zaman aşımına uğradı.";
            break;
        }

        // showError(message);

        setError((prev) => ({
          ...prev,
          latitude: message,
          longitude: message,
        }));

        setLoadingLocation(false);
      }
    );
  };
  useEffect(() => {
    console.log("📍 LAT:", latitude);
    console.log("📍 LNG:", longitude);
  }, [latitude, longitude]);
  useEffect(() => {
    if (currentUser) {
      if (currentUser.city) setCitie(currentUser.city);
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.phone) setPhoneNumber(currentUser.phone);
      setBusinessName(currentUser.username || "");
      setType(currentUser.type || "");
    }
  }, [currentUser]);

  // şehirleri çek
  useEffect(() => {
    async function citiesCall() {
      try {
        const cities = await apiRequest.get("/locations");
        setCities(cities.data);
      } catch (error) {
        showError(" Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
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
        } catch (error) {
          showError(" Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }
      }
    }
    districhCall();
  }, [citie]);

  // Form gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    const newErrors = {};

    if (!inputs.title?.trim()) newErrors.title = "Kampanya başlığı boş olamaz";
    if (!inputs.price) newErrors.price = "Fiyat boş olamaz";
    if (!inputs.address?.trim()) newErrors.address = "Adres boş olamaz";
    if (!citie) newErrors.city = "İl seçiniz";
    if (!district) newErrors.district = "İlçe seçiniz";
    if (!latitude) newErrors.latitude = "Konum bilgisi alınamadı";
    if (!longitude) newErrors.longitude = "Konum bilgisi alınamadı";
    if (!inputs.type) newErrors.type = "Kampanya türü seçiniz";
    if (!inputs.businessName?.trim())
      newErrors.businessName = "İşletme adı boş olamaz";
    if (!inputs.campaignDuration?.trim())
      newErrors.campaignDuration = "Kampanya süresi boş olamaz";
    if (!inputs.discountAmount?.trim())
      newErrors.discountAmount = "İndirim miktarı boş olamaz";
    if (!phoneNumber?.trim())
      newErrors.phoneNumber = "Telefon numarası boş olamaz";
    if (!value?.trim()) newErrors.desc = "Açıklama boş olamaz";

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({});
    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: citie,
          district,
          type: currentUser?.type || inputs.type,
          businessName: currentUser?.username || inputs.businessName,
          // username: currentUser?.username,
          latitude,
          longitude,
          phoneNumber,
          images,
          approved: false,
        },
        postDetail: {
          desc: value,
          campaignDuration: inputs.campaignDuration,
          discountAmount: inputs.discountAmount,
        },
      });

      navigate("/" + res.data.id);
    } catch (err) {
      console.log(err);
      setError({ submit: "Sunucu hatası, lütfen tekrar deneyiniz." });
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1 className="mainTitle">Yeni Kampanya Ekle</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="businessName">İşletme Adı</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              {error.businessName && (
                <span className="error">{error.businessName}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="title">Kampanya Başlığı</label>
              <input id="title" name="title" type="text" />
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
                {cities.map((city, index) => (
                  <option key={index} value={city.il_adi}>
                    {city.il_adi}
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
                {districhs.map((districh, index) => (
                  <option key={index} value={districh.ilce_adi}>
                    {districh.ilce_adi}
                  </option>
                ))}
              </select>
              {error.district && (
                <span className="error">{error.district}</span>
              )}
            </div>
            <div className="item">
              <label htmlFor="address">Adres</label>
              <input id="address" name="address" type="text" />
              {error.address && <span className="error">{error.address}</span>}
            </div>
            {/* 🔹 Latitude & Longitude */}
            <div className="item locationFields">
              {/* <div className="locInputs"> */}
              {/* <div>
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                {error.latitude && (
                  <span className="error">{error.latitude}</span>
                )}
              </div> */}
              {/* <div>
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                  {error.longitude && (
                    <span className="error">{error.longitude}</span>
                  )}
                </div>
              </div> */}
              {latitude && longitude ? "konum alındı" : "konum alınamadı"}
              {error.longitude && (
                <span className="error">
                  {error.longitude}
                  {error.latitude}
                </span>
              )}
              {latitude && longitude ? (
                ""
              ) : (
                <button
                  type="button"
                  className="getLocationBtn"
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? "Konum alınıyor..." : "📍 Konumumu Al"}
                </button>
              )}
            </div>

            <div className="item">
              <label htmlFor="price">Fiyat</label>
              <input id="price" name="price" type="number" />
              {error.price && <span className="error">{error.price}</span>}
            </div>
            <div className="item">
              <label htmlFor="type">Kampanya Türü</label>

              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Kategori Seçin</option>
                {/* ================= GIDA & YEME İÇME ================= */}
                <optgroup label="Gıda & Yeme İçme">
                  <option value="bakkal">Bakkal</option>
                  <option value="market">Market</option>
                  <option value="manav">Manav</option>
                  <option value="kasap">Kasap</option>
                  <option value="sarkuteri">Şarküteri</option>
                  <option value="kuruyemisci">Kuruyemişçi</option>
                  <option value="balikci">Balıkçı</option>
                  <option value="firin">Fırın / Ekmekçi</option>
                  <option value="pastane">Pastane</option>
                  <option value="lokanta">Lokanta / Restoran</option>
                  <option value="donerci">Dönerci / Kebapçı</option>
                  <option value="fastfood">Fast Food</option>
                  <option value="tatlici">Tatlıcı / Baklavacı</option>
                  <option value="cigkofteci">Çiğköfteci</option>
                  <option value="kahveci">Kahveci</option>
                  <option value="cafe">Cafe / Kahvehane</option>
                  <option value="cay-ocagi">Çay Ocağı</option>
                  <option value="bufe">Büfe</option>
                  <option value="dondurmaci">Dondurmacı</option>
                  <option value="yufkaci">Yufkacı</option>
                  <option value="su-bayii">Su Bayii</option>
                </optgroup>

                {/* ================= ULAŞIM & TAŞIMACILIK ================= */}
                <optgroup label="Ulaşım & Taşımacılık">
                  <option value="taksici">Taksici</option>
                  <option value="dolmuscu">Dolmuşçu</option>
                  <option value="minibuscu">Minibüsçü</option>
                  <option value="otobus-soforu">Otobüs Şoförü</option>
                  <option value="servis-araci">Servis Aracı</option>
                  <option value="nakliyeci">Nakliyeci</option>
                  <option value="kamyoncu">Kamyoncu</option>
                  <option value="motorlu-kurye">Motorlu Kurye</option>
                  <option value="bisikletli-kurye">Bisikletli Kurye</option>
                  <option value="kargo-dagitim">Kargo Dağıtım</option>
                  <option value="oto-kiralama">
                    Oto Kiralama (Rent a Car)
                  </option>
                </optgroup>

                {/* ================= OTO & MOTOR ================= */}
                <optgroup label="Oto & Motor Hizmetleri">
                  <option value="oto-tamir">Oto Tamircisi</option>
                  <option value="oto-elektrik">Oto Elektrikçisi</option>
                  <option value="kaportaci">Kaportacı</option>
                  <option value="oto-boyaci">Oto Boyacısı</option>
                  <option value="oto-yikama">Oto Yıkama</option>
                  <option value="lastikci">Lastikçi</option>
                  <option value="egzozcu">Egzozcu</option>
                  <option value="oto-aksesuar">Oto Aksesuar</option>
                  <option value="oto-ekspertiz">Oto Ekspertiz</option>
                  <option value="yedek-parca">Yedek Parça</option>
                  <option value="motosiklet-tamir">Motosiklet Tamiri</option>
                </optgroup>

                {/* ================= EV & İNŞAAT ================= */}
                <optgroup label="İnşaat & Ev Hizmetleri">
                  <option value="insaat-ustasi">İnşaat Ustası</option>
                  <option value="boyaci">Boyacı / Badanacı</option>
                  <option value="tesisatci">Sıhhi Tesisatçı</option>
                  <option value="elektrikci">Elektrikçi</option>
                  <option value="alcipan">Alçıpan Ustası</option>
                  <option value="fayans">Fayans / Seramik</option>
                  <option value="camci">Camcı</option>
                  <option value="pvc-dograma">PVC Doğrama</option>
                  <option value="demir-dograma">Demir Doğrama</option>
                  <option value="cati">Çatı Ustası</option>
                  <option value="kombici">Kombi / Kalorifer</option>
                </optgroup>

                {/* ================= MOBİLYA & AHŞAP ================= */}
                <optgroup label="Mobilya & Ahşap">
                  <option value="marangoz">Marangoz</option>
                  <option value="mobilya">Mobilya</option>
                  <option value="mobilya-imalat">Mobilya İmalatı</option>
                  <option value="mobilya-tamir">Mobilya Tamiri</option>
                  <option value="parke">Parke Ustası</option>
                  <option value="lake-ustasi">Lake Ustası</option>
                </optgroup>

                {/* ================= GİYİM & BAKIM ================= */}
                <optgroup label="Giyim & Kişisel Bakım">
                  <option value="berber">Berber</option>
                  <option value="kuafor">Kuaför</option>
                  <option value="guzellik-salonu">Güzellik Salonu</option>
                  <option value="terzi">Terzi</option>
                  <option value="kuru-temizleme">Kuru Temizleme</option>
                  <option value="ayakkabi-tamir">Ayakkabı Tamiri</option>
                  <option value="camasirhane">Çamaşırhane</option>
                </optgroup>

                {/* ================= TEKNOLOJİ ================= */}
                <optgroup label="Teknoloji & Elektronik">
                  <option value="telefon-tamir">Telefon Tamiri</option>
                  <option value="bilgisayar-tamir">Bilgisayar Tamiri</option>
                  <option value="beyaz-esya">Beyaz Eşya</option>
                  <option value="beyaz-esya">Beyaz Eşya Servisi</option>
                  <option value="tv-tamir">Televizyon Tamiri</option>
                  <option value="kamera-alarm">
                    Kamera / Alarm Sistemleri
                  </option>
                </optgroup>

                {/* ================= SAĞLIK ================= */}
                <optgroup label="Sağlık & Medikal">
                  <option value="eczane">Eczane</option>
                  <option value="medikal">Medikal Ürünler</option>
                  <option value="optik">Optik</option>
                  <option value="dis-klinigi">Diş Kliniği</option>
                  <option value="veteriner">Veteriner</option>
                </optgroup>

                {/* ================= TARIM ================= */}
                <optgroup label="Tarım & Hayvancılık">
                  <option value="ciftci">Çiftçi</option>
                  <option value="sutcu">Sütçü</option>
                  <option value="yumurta">Yumurta Satıcısı</option>
                  <option value="arici">Arıcı</option>
                  <option value="cicekci">Çiçekçi</option>
                </optgroup>

                {/* ================= GENEL HİZMET ================= */}
                <optgroup label="Genel Hizmetler">
                  <option value="temizlik">Temizlik Hizmeti</option>
                  <option value="hali-yikama">Halı Yıkama</option>
                  <option value="koltuk-yikama">Koltuk Yıkama</option>
                  <option value="organizasyon">Organizasyon</option>
                  <option value="fotografci">Fotoğrafçı</option>
                  <option value="matbaa">Matbaa</option>
                  <option value="cilingir">Çilingir</option>
                  <option value="danismanlik">Danışmanlık</option>
                </optgroup>

                {/* ================= DİĞER ================= */}
                <optgroup label="Diğer">
                  <option value="emlak">Emlak Danışmanı</option>
                  <option value="sigorta">Sigorta Acentesi</option>
                  <option value="seyyar-satici">Seyyar Satıcı</option>
                  <option value="kuryelik">Kuryelik</option>
                </optgroup>
              </select>

              {error.type && <span className="error">{error.type}</span>}
            </div>

            <div className="item">
              <label htmlFor="campaignDuration">Kampanya Süresi</label>
              <input
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
              <input id="discountAmount" name="discountAmount" type="text" />
              {error.discountAmount && (
                <span className="error">{error.discountAmount}</span>
              )}
            </div>

            {/* 🔹 currentUser.phone otomatik dolu */}
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

            <div className="item description">
              <label htmlFor="desc">Açıklama</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
              {error.desc && <span className="error">{error.desc}</span>}
            </div>

            <div className="uploadMobileWrapper">
              <UploadWidget
                uwConfig={{
                  multiple: true,
                  cloudName: "difmqapnr",
                  uploadPreset: "bedavadanbul",
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
            cloudName: "difmqapnr",
            uploadPreset: "bedavadanbul",
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
