import { useEffect, useState, useContext, useRef } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useError } from "../../context/ErrorContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCategories } from "../../lib/useCategories";
import { getListingPrice } from "../../lib/pricing";
import PaymentModal from "../../components/PaymentModal/PaymentModal";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
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
  const [categoryId, setCategoryId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { showError } = useError();
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();
  const [initialMapCenter, setInitialMapCenter] = useState([39.9255, 32.8663]); // fallback Ankara
  const [mapKey, setMapKey] = useState(0);
  const { currentUser } = useContext(AuthContext);
  const [listingType, setListingType] = useState("standard");
  const [mapCenter, setMapCenter] = useState([41.0082, 28.9784]); // fallback
  const [mapPosition, setMapPosition] = useState(null);
  const mapRef = useRef(null);
  const categories = useCategories();
  const [pending, setPending] = useState(false);
  const [locationMode, setLocationMode] = useState("map");
  const [adDuration, setAdDuration] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingInputs, setPendingInputs] = useState(null);
  const currentPrice = getListingPrice(listingType, Number(adDuration || 0));
  function LocationPicker({ setLatitude, setLongitude, setMapPosition }) {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat.toFixed(6));
        setLongitude(e.latlng.lng.toFixed(6));
        setMapPosition({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });

    return null;
  }

  const getCoordsFromCityDistrict = async (city, district) => {
    try {
      const q = `${district}, ${city}, Turkey`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q,
        )}`,
      );
      const data = await res.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
    return null;
  };

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
      },
    );
  };

  useEffect(() => {
    const initLocation = async () => {
      // 1️⃣ İl + ilçe varsa
      if (citie && district) {
        const coords = await getCoordsFromCityDistrict(citie, district);

        if (coords) {
          setLatitude(coords.lat.toFixed(6));
          setLongitude(coords.lng.toFixed(6));
          setMapCenter([coords.lat, coords.lng]);
          setMapPosition(coords);

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
              mapRef.current.setView([coords.lat, coords.lng], 14);
            }
          }, 300);

          return; // 🔴 burası önemli
        }
      }

      // 2️⃣ İl/ilçe yoksa tarayıcı konumu
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            setLatitude(lat.toFixed(6));
            setLongitude(lng.toFixed(6));
            setMapCenter([lat, lng]);
            setMapPosition({ lat, lng });

            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize();
                mapRef.current.setView([lat, lng], 15);
              }
            }, 300);
          },
          () => {
            // 3️⃣ fallback
            setMapCenter([41.0082, 28.9784]);
          },
        );
      }
    };

    initLocation();
  }, [citie, district]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser?.city) setCitie(currentUser?.city);
      if (currentUser?.district) setDistrict(currentUser?.district);
      if (currentUser?.phone) setPhoneNumber(currentUser?.phone);
      setBusinessName(currentUser?.username || "");
      setCategoryId(currentUser?.categoryId || "");
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

    if (pending) return;

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
    if (!inputs.categoryId) newErrors.categoryId = "Kampanya türü seçiniz";
    if (!inputs.businessName?.trim())
      newErrors.businessName = "İşletme adı boş olamaz";
    if (!inputs.adDuration) newErrors.adDuration = "Reklam süresi seçiniz";
    if (!inputs.discountAmount?.trim())
      newErrors.discountAmount = "İndirim miktarı boş olamaz";
    if (!phoneNumber?.trim())
      newErrors.phoneNumber = "Telefon numarası boş olamaz";
    if (!value?.trim()) newErrors.desc = "Açıklama boş olamaz";
    if (!listingType) newErrors.listingType = "İlan tipi seçiniz";
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({});

    // 🔹 Sadece Vitrin/Doping ücretlidir; Standart ilan her zaman ücretsiz
    // yayınlanır (bkz. lib/pricing.js). Ücretli bir seçenekse önce ödeme
    // adımını göster, ilanı ancak ödeme (simülasyonu) tamamlanınca oluştur.
    const price = getListingPrice(listingType, Number(inputs.adDuration));

    if (price > 0) {
      setPendingInputs(inputs);
      setShowPayment(true);
      return;
    }

    await publishPost(inputs);
  };

  // ✅ İlanı fiilen oluşturan istek. Standart ilanlarda handleSubmit
  // tarafından doğrudan, ücretli ilanlarda ise ödeme modalındaki
  // "Öde ve Yayınla" başarılı olduğunda çağrılır.
  const publishPost = async (inputs) => {
    try {
      setPending(true);

      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: citie,
          district,
          categoryId: currentUser?.categoryId || inputs.categoryId,
          businessName: currentUser?.username || inputs.businessName,
          latitude,
          longitude,
          phoneNumber,
          images,
          approved: false,
          listingType,
          adDuration: Number(inputs.adDuration),
        },
        postDetail: {
          desc: value,
          campaignDuration: inputs.campaignDuration,
          discountAmount: inputs.discountAmount,
        },
      });

      navigate("/" + res.data.id);
    } catch (err) {
      setError({
        submit: "Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.",
      });
    } finally {
      setPending(false);
      setShowPayment(false);
    }
  };
  useEffect(() => {
    if (latitude && longitude && mapRef.current) {
      mapRef.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  const mapHeight = "min(320px, 55vh)";

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <div className="wrapper">
          <form onSubmit={handleSubmit} noValidate>
            {/* 1 — Kampanya bilgileri */}
            <section className="formSection">
              <header className="sectionHead">
                <span className="num">1</span>
                <div>
                  <h3>Kampanya bilgileri</h3>
                  <p>Müşterinin ilk gördüğü bilgiler: kısa ve net yazın</p>
                </div>
              </header>

              <div className="item">
                <label htmlFor="title">Kampanya başlığı</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Örn: Kol saatlerinde %30 indirim"
                />
                {error.title && <span className="error">{error.title}</span>}
              </div>

              <div className="grid2">
                <div className="item">
                  <label htmlFor="price">Fiyat (₺)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="Örn: 1000"
                  />
                  {error.price && <span className="error">{error.price}</span>}
                </div>
                <div className="item">
                  <label htmlFor="discountAmount">İndirim miktarı</label>
                  <input
                    id="discountAmount"
                    name="discountAmount"
                    type="text"
                    placeholder="Örn: %30 veya 2 al 1 öde"
                  />
                  {error.discountAmount && (
                    <span className="error">{error.discountAmount}</span>
                  )}
                </div>
              </div>

              <div className="item">
                <label htmlFor="type">Kampanya türü</label>
                <select
                  id="type"
                  name="categoryId"
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

              <div className="item description">
                <label htmlFor="desc">Açıklama</label>
                <ReactQuill
                  theme="snow"
                  onChange={setValue}
                  value={value}
                  placeholder="Kampanyanızı, geçerlilik koşullarını ve avantajlarınızı anlatın"
                />
                {error.desc && <span className="error">{error.desc}</span>}
              </div>
            </section>

            {/* 2 — İlan tipi ve süre */}
            <section className="formSection">
              <header className="sectionHead">
                <span className="num">2</span>
                <div>
                  <h3>İlan tipi ve yayın süresi</h3>
                  <p>Standart ilan her zaman ücretsiz yayınlanır</p>
                </div>
              </header>

              <div className="item listingTypePicker">
                <label>İlan tipi</label>

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

                {error.listingType && (
                  <span className="error">{error.listingType}</span>
                )}
              </div>

              <div className="item durationPicker">
                <label>Reklam yayın süresi</label>
                <input type="hidden" name="adDuration" value={adDuration} />

                <div className="durationChips">
                  {[1, 3, 6, 12].map((months) => {
                    const price = getListingPrice(listingType, months);
                    return (
                      <button
                        type="button"
                        key={months}
                        className={`durationChip${adDuration === String(months) ? " selected" : ""}`}
                        onClick={() => setAdDuration(String(months))}
                      >
                        <span className="months">
                          {months === 12 ? "1 Yıl" : `${months} Ay`}
                        </span>
                        <span className="price">
                          {price > 0
                            ? `${price.toLocaleString("tr-TR")} ₺`
                            : "Ücretsiz"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {error.adDuration && (
                  <span className="error">{error.adDuration}</span>
                )}

                {adDuration && (
                  <div className="priceSummary">
                    <span>Toplam Tutar</span>
                    <strong>
                      {currentPrice > 0
                        ? `${currentPrice.toLocaleString("tr-TR")} ₺`
                        : "Ücretsiz"}
                    </strong>
                  </div>
                )}
              </div>
            </section>

            {/* 3 — Konum */}
            <section className="formSection">
              <header className="sectionHead">
                <span className="num">3</span>
                <div>
                  <h3>Konum</h3>
                  <p>Müşteriler sizi haritada bulabilsin</p>
                </div>
              </header>

              <div className="grid2">
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
              </div>

              <div className="item">
                <label htmlFor="address">Adres</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Mahalle, cadde, no"
                />
                {error.address && <span className="error">{error.address}</span>}
              </div>

              {/* 🔹 Latitude & Longitude */}
              <div className="item locationFields">
                {error.longitude && (
                  <span className="error">
                    {error.longitude}
                    {error.latitude}
                  </span>
                )}

                <div className="item mapItem">
                  <label>Konum seçimi</label>

                  <div className="segMini" role="tablist">
                    <button
                      type="button"
                      className={locationMode === "map" ? "active" : ""}
                      onClick={() => setLocationMode("map")}
                    >
                      Haritadan seç
                    </button>
                    <button
                      type="button"
                      className={locationMode === "manual" ? "active" : ""}
                      onClick={() => setLocationMode("manual")}
                    >
                      Manuel gir
                    </button>
                  </div>

                  {/* MAP MODE */}
                  {locationMode === "map" && (
                    <div className="mapBox" style={{ height: mapHeight }}>
                      <MapContainer
                        center={mapCenter}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        whenCreated={(mapInstance) => {
                          mapRef.current = mapInstance;
                        }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <LocationPicker
                          setLatitude={setLatitude}
                          setLongitude={setLongitude}
                          setMapPosition={setMapPosition}
                        />

                        {mapPosition && <Marker position={mapPosition} />}
                      </MapContainer>
                    </div>
                  )}

                  {/* MANUAL MODE */}
                  {locationMode === "manual" && (
                    <div className="grid2 manualCoords">
                      <input
                        type="number"
                        placeholder="Enlem (latitude)"
                        value={latitude || ""}
                        onChange={(e) => {
                          const lat = String(e.target.value);
                          setLatitude(lat);
                          if (longitude) setMapPosition([lat, longitude]);
                        }}
                      />

                      <input
                        type="number"
                        placeholder="Boylam (longitude)"
                        value={longitude || ""}
                        onChange={(e) => {
                          const lng = String(e.target.value);
                          setLongitude(lng);
                          if (latitude) setMapPosition([latitude, lng]);
                        }}
                      />
                    </div>
                  )}

                  {/* STATUS */}
                  {latitude && longitude ? (
                    <span className="locOk">Konum seçildi</span>
                  ) : (
                    <span className="error">Konum seçiniz</span>
                  )}
                </div>
              </div>
            </section>

            {/* 4 — İletişim */}
            <section className="formSection">
              <header className="sectionHead">
                <span className="num">4</span>
                <div>
                  <h3>İşletme ve iletişim</h3>
                  <p>Müşteriler sizi bu numaradan arayacak</p>
                </div>
              </header>

              <div className="grid2">
                <div className="item">
                  <label htmlFor="businessName">İşletme adı</label>
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
                {/* 🔹 currentUser.phone otomatik dolu */}
                <div className="item">
                  <label htmlFor="phoneNumber">Telefon numarası</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {error.phoneNumber && (
                    <span className="error">{error.phoneNumber}</span>
                  )}
                </div>
              </div>
            </section>

            {/* 5 — Fotoğraflar */}
            <section className="formSection photoSection">
              <header className="sectionHead">
                <span className="num">5</span>
                <div>
                  <h3>Fotoğraflar</h3>
                  <p>Fotoğraflı kampanyalar çok daha fazla ilgi görür</p>
                </div>
              </header>

              <UploadWidget
                uwConfig={{
                  multiple: true,
                  cloudName: "difmqapnr",
                  uploadPreset: "bedavadanbul",
                  folder: "posts",
                }}
                setState={setImages}
              />
              {images.length > 0 && (
                <div className="imageGrid">
                  {images.map((image, index) => (
                    <div className="imageItem" key={index}>
                      <img src={image.url || image} alt={`upload-${index}`} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Gönder çubuğu: mobilde ekranın altında yapışık kalır */}
            <div className="submitBar">
              {error.submit && <span className="error">{error.submit}</span>}
              <button className="sendButton" disabled={pending}>
                {pending
                  ? "Yükleniyor..."
                  : currentPrice > 0
                    ? `Ödemeye Geç · ${currentPrice.toLocaleString("tr-TR")} ₺`
                    : "İlanı Ücretsiz Yayınla"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          amount={currentPrice}
          listingType={listingType}
          duration={pendingInputs?.adDuration || adDuration}
          onClose={() => setShowPayment(false)}
          onSuccess={() => publishPost(pendingInputs)}
        />
      )}
    </div>
  );
}

export default NewPostPage;
