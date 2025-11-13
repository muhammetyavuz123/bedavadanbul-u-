import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import InputMask from "react-input-mask";
import { normalizePhone } from "../../lib/normalizePhone";

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

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await apiRequest.get("/locations");
        setCities(res.data);
      } catch (err) {
        console.error("Şehir verisi alınamadı:", err);
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
          console.error("İlçe verisi alınamadı:", err);
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
            <InputMask mask="+90 (599) 999 99 99">
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
            <InputMask mask="+90 (599) 999 99 99">
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
              <option value="market">Market</option>
              <option value="lokanta">Lokanta / Restoran</option>
              <option value="berber">Berber / Kuaför</option>
              <option value="tamirci">Tamirci</option>
              <option value="emlak">Emlak Danışmanı</option>
              {/* (kategori listesinin kalanını buraya ekleyebilirsin) */}
            </select>

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
