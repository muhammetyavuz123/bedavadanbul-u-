import { useState, useEffect } from "react";
import "./filter.scss";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
  });

  const { showError } = useError();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Şehir değişirse ilçe sıfırla
    if (name === "city") {
      setQuery((prev) => ({
        ...prev,
        city: value,
        district: "", // ilçe temizlenir
      }));
    } else {
      setQuery((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();

    // Boş değerleri URL'e yazmamak için filtrele
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== "")
    );

    setSearchParams(cleanQuery);
  };

  const clearField = (field) => {
    if (field === "city") {
      // şehir silinirse ilçe de silinsin
      setQuery((prev) => ({ ...prev, city: "", district: "" }));
    } else {
      setQuery((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await apiRequest.get("/locations");
        setCities(res.data);
      } catch (error) {
        showError(
          "Şehir verisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchDistricts() {
      if (query.city) {
        try {
          const res = await apiRequest.get(`/locations/${query.city}`);
          setDistricts(res.data);
        } catch (error) {
          showError(
            "İlçe verisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      } else {
        setDistricts([]); // şehir silinirse ilçe temizle
      }
    }
    fetchDistricts();
  }, [query.city]);

  return (
    <div className="filter-container">
      <form className="filter-form" onSubmit={handleFilter}>
        {/* 🔎 Arama */}
        <div className="search-input">
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          <input
            type="text"
            placeholder="Anahtar kelime ara..."
            value={query.search}
            name="search"
            onChange={handleChange}
          />

          {query.search && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => clearField("search")}
            >
              ✕
            </button>
          )}
        </div>

        {/* 🏙️ Şehir */}
        <div className="filter-group">
          <label htmlFor="city">Şehir</label>
          <div className="select-wrapper">
            <select
              id="city"
              name="city"
              onChange={handleChange}
              value={query.city}
            >
              <option value="">Tümü</option>
              {cities.map((city, i) => (
                <option key={i} value={city?.il_adi}>
                  {city?.il_adi}
                </option>
              ))}
            </select>
            {query.city && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearField("city")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 🏘️ İlçe */}
        <div className="filter-group">
          <label htmlFor="district">İlçe</label>
          <div className="select-wrapper">
            <select
              id="district"
              name="district"
              onChange={handleChange}
              value={query.district}
              disabled={!query.city}
            >
              <option value="">Tümü</option>
              {districts.map((d, i) => (
                <option key={i} value={d?.ilce_adi}>
                  {d?.ilce_adi}
                </option>
              ))}
            </select>
            {query.district && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearField("district")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="type">Kategori</label>
          <div className="select-wrapper">
            <select
              id="type"
              name="type"
              onChange={handleChange}
              value={query.type}
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
                <option value="beyaz-esya">Beyaz Eşya Servisi</option>
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

            {query.type && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearField("type")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 🔘 Filtrele Butonu */}
        <button type="submit" className="search-btn">
          <img src="/search.png" alt="Ara" />
          Filtrele
        </button>
      </form>
    </div>
  );
}

export default Filter;
