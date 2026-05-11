import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./searchBar.scss";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";
import { useCategories } from "../../lib/useCategories";

function SearchBar() {
  const [query, setQuery] = useState({
    type: "",
    city: "",
    district: "",
  });
  const { showError } = useError();
  const [categoryId, setCategoryId] = useState("");
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const categories = useCategories();
  const handleChange = (e) => {
    setQuery((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Şehirleri getir
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

  // İlçe verilerini getir
  useEffect(() => {
    async function districtCall() {
      if (query.city) {
        try {
          const response = await apiRequest.get(`/locations/${query.city}`);
          setDistricts(response.data);
        } catch (error) {
          showError(" Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }
      } else {
        setDistricts([]);
      }
    }
    districtCall();
  }, [query.city]);

  const handleClick = () => {
    navigate(
      `/list?categoryId=${query.type}&city=${query.city}&district=${query.district}`,
    );
  };

  return (
    <form className="form-wrapper">
      {/* İl ve İlçe */}
      <div className="city-district">
        <select name="city" value={query.city} onChange={handleChange}>
          <option value="">Şehir Seçiniz</option>
          {cities.map((city, index) => (
            <option key={index} value={city.il_adi}>
              {city.il_adi}
            </option>
          ))}
        </select>

        <select
          name="district"
          value={query.district}
          onChange={handleChange}
          disabled={!query.city}
        >
          <option value="">İlçe Seçiniz</option>
          {districts.map((district, index) => (
            <option key={index} value={district.ilce_adi}>
              {district.ilce_adi}
            </option>
          ))}
        </select>
      </div>
      <select id="type" name="type" onChange={handleChange} value={query.type}>
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
      {/* Kategori */}
      {/* <select id="type" name="type" onChange={handleChange} value={query.type}>
        <option value="">Kategori Seçin</option>

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

        <optgroup label="Mobilya & Ahşap">
          <option value="marangoz">Marangoz</option>
          <option value="mobilya">Mobilya</option>
          <option value="mobilya-imalat">Mobilya İmalatı</option>
          <option value="mobilya-tamir">Mobilya Tamiri</option>
          <option value="parke">Parke Ustası</option>
          <option value="lake-ustasi">Lake Ustası</option>
        </optgroup>

        <optgroup label="Giyim & Kişisel Bakım">
          <option value="berber">Berber</option>
          <option value="kuafor">Kuaför</option>
          <option value="guzellik-salonu">Güzellik Salonu</option>
          <option value="terzi">Terzi</option>
          <option value="kuru-temizleme">Kuru Temizleme</option>
          <option value="ayakkabi-tamir">Ayakkabı Tamiri</option>
          <option value="camasirhane">Çamaşırhane</option>
        </optgroup>

        <optgroup label="Teknoloji & Elektronik">
          <option value="telefon-tamir">Telefon Tamiri</option>
          <option value="bilgisayar-tamir">Bilgisayar Tamiri</option>
          <option value="beyaz-esya">Beyaz Eşya</option>
          <option value="beyaz-esya">Beyaz Eşya Servisi</option>
          <option value="tv-tamir">Televizyon Tamiri</option>
          <option value="kamera-alarm">Kamera / Alarm Sistemleri</option>
        </optgroup>

        <optgroup label="Sağlık & Medikal">
          <option value="eczane">Eczane</option>
          <option value="medikal">Medikal Ürünler</option>
          <option value="optik">Optik</option>
          <option value="dis-klinigi">Diş Kliniği</option>
          <option value="veteriner">Veteriner</option>
        </optgroup>

        <optgroup label="Tarım & Hayvancılık">
          <option value="ciftci">Çiftçi</option>
          <option value="sutcu">Sütçü</option>
          <option value="yumurta">Yumurta Satıcısı</option>
          <option value="arici">Arıcı</option>
          <option value="cicekci">Çiçekçi</option>
        </optgroup>

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

        <optgroup label="Diğer">
          <option value="emlak">Emlak Danışmanı</option>
          <option value="sigorta">Sigorta Acentesi</option>
          <option value="seyyar-satici">Seyyar Satıcı</option>
          <option value="kuryelik">Kuryelik</option>
        </optgroup>
      </select> */}

      {/* Arama Butonu */}
      <button type="button" className="form-button" onClick={handleClick}>
        <img src="/search.png" alt="Ara" />
        <span>Ara</span>
      </button>
    </form>
  );
}

export default SearchBar;
