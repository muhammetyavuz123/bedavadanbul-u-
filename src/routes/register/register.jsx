import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import InputMask from "react-input-mask";
import { normalizePhone } from "../../lib/normalizePhone";
import { useError } from "../../context/ErrorContext";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const { showError } = useError();

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await apiRequest.get("/locations");
        setCities(res.data);
      } catch (err) {
        showError(
          "Veri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Şehir Bilgisi alınamadı"
        );
      }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchDistricts() {
      if (selectedCity) {
        try {
          const res = await apiRequest.get(`/locations/${selectedCity}`);
          setDistricts(res.data);
        } catch (err) {
          showError(
            "Veri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin. İlçe Bilgisi alınamadı"
          );
        }
      } else {
        setDistricts([]);
      }
    }
    fetchDistricts();
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const rawPhone = formData.get("phone");
    const phone = normalizePhone(rawPhone);
    const email = formData.get("email");
    const password = formData.get("password");
    const type = formData.get("type");
    const role = userType === "business" ? "business" : "user";

    // 🔐 Yasal onay kontrolü
    if (!formData.get("kvkk") || !formData.get("terms")) {
      setError("Lütfen KVKK ve Kullanım Şartlarını onaylayınız.");
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest.post("/auth/register", {
        type: type || undefined,
        username,
        phone,
        email,
        password,
        role,
        city: selectedCity,
        district: selectedDistrict,
        marketingConsent: formData.get("sms_email_consent") ? true : false,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordFields = () => (
    <>
      <div className="input-group">
        <div className="input-with-icon">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
      </div>

      <div className="input-group">
        <div className="input-with-icon">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Şifre (Tekrar)"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "🙈" : "👁️"}
          </span>
        </div>
      </div>

      {confirm && (
        <p
          className={`match-text ${password === confirm ? "success" : "error"}`}
        >
          {password === confirm
            ? "✅ Şifreler eşleşiyor"
            : "❌ Şifreler uyuşmuyor"}
        </p>
      )}
      {error && <span className="error-text">{error}</span>}
    </>
  );

  const renderLocationFields = () => (
    <>
      <div className="input-group">
        <div className="input-with-icon">
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedDistrict("");
            }}
            required
          >
            <option value="">Şehir seçiniz</option>
            {cities.map((city, i) => (
              <option key={i} value={city.il_adi}>
                {city.il_adi}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group">
        <div className="input-with-icon">
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedCity}
            required
          >
            <option value="">İlçe seçiniz</option>
            {districts.map((d, i) => (
              <option key={i} value={d.ilce_adi}>
                {d.ilce_adi}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );

  const renderLegalCheckboxes = () => (
    <div className="terms-section">
      <label className="checkbox-label">
        <input type="checkbox" name="kvkk" required />
        <span>
          <Link to="/legal/kvkk" target="_blank">
            KVKK Aydınlatma Metni’ni
          </Link>{" "}
          ve{" "}
          <Link to="/legal/privacy-policy" target="_blank">
            Gizlilik Politikasını
          </Link>{" "}
          okudum, kişisel verilerimin işlenmesine açık rıza veriyorum.
        </span>
      </label>

      <label className="checkbox-label">
        <input type="checkbox" name="terms" required />
        <span>
          <Link to="/legal/terms-of-use" target="_blank">
            Kullanım Şartları’nı
          </Link>{" "}
          okudum ve kabul ediyorum.
        </span>
      </label>

      <label className="checkbox-label optional">
        <input type="checkbox" name="sms_email_consent" />
        <span>
          Kampanyalar ve duyurular hakkında e-posta / SMS almak istiyorum.
        </span>
      </label>
    </div>
  );

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2>Kayıt Ol</h2>

        {!userType && (
          <div className="select-type">
            <p>Devam etmek için bir tür seçin:</p>
            <button onClick={() => setUserType("user")}>
              Bireysel Kullanıcı
            </button>
            <button onClick={() => setUserType("business")}>İşyeri</button>
          </div>
        )}

        {/* 🔹 Bireysel Kullanıcı */}
        {userType === "user" && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>Bireysel Kullanıcı Kaydı</h3>
            <input
              name="username"
              type="text"
              placeholder="Ad Soyad"
              required
            />
            <input name="email" type="email" placeholder="E-Posta" required />
            <InputMask mask="+90 (599) 999 99 99" defaultValue="9">
              {(inputProps) => (
                <input
                  {...inputProps}
                  name="phone"
                  type="text"
                  placeholder="Cep Telefon Numarası"
                  required
                />
              )}
            </InputMask>

            {renderLocationFields()}
            {renderPasswordFields()}
            {renderLegalCheckboxes()}

            <button type="submit" disabled={isLoading || password !== confirm}>
              {isLoading ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
            {error && <span className="error-text">{error}</span>}
            <Link to="/login">
              <span style={{ color: "#ff3c38" }}>Zaten bir hesabım var</span>
            </Link>
          </form>
        )}

        {/* 🔹 İş Yeri Kaydı */}
        {userType === "business" && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>İşyeri Kaydı</h3>
            <input
              name="username"
              type="text"
              placeholder="Firma Adı"
              required
            />
            <input name="email" type="email" placeholder="E-Posta" required />
            <InputMask mask="+90 (599) 999 99 99" defaultValue="9">
              {(inputProps) => (
                <input
                  {...inputProps}
                  name="phone"
                  type="text"
                  placeholder="Cep Telefon Numarası"
                  required
                />
              )}
            </InputMask>

            <select name="type" required>
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
                <option value="oto-kiralama">Oto Kiralama (Rent a Car)</option>
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
                <option value="beyaz-esya-servisi">Beyaz Eşya Servisi</option>
                <option value="tv-tamir">Televizyon Tamiri</option>
                <option value="kamera-alarm">Kamera / Alarm Sistemleri</option>
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

            {renderLocationFields()}
            {renderPasswordFields()}
            {renderLegalCheckboxes()}

            <button type="submit" disabled={isLoading || password !== confirm}>
              {isLoading ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
            <Link to="/login">
              <span style={{ color: "#ff3c38" }}>Zaten bir hesabım var</span>
            </Link>
          </form>
        )}

        {userType && (
          <button className="back-btn" onClick={() => setUserType("")}>
            ⬅ Geri
          </button>
        )}
      </div>
    </AuthLayout>
  );
}

export default Register;
