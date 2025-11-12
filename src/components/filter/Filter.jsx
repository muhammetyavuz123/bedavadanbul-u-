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

              <optgroup label="Gıda ve Market Esnafı">
                <option value="bakkal">Bakkal</option>
                <option value="market">Market işletmecisi</option>
                <option value="manav">Manav</option>
                <option value="kasap">Kasap</option>
                <option value="sarkuteri">Şarküteri</option>
                <option value="kuruyemisci">Kuruyemişçi</option>
                <option value="balikci">Balıkçı</option>
                <option value="firinci">Fırıncı / Ekmekçi</option>
                <option value="unlu-mamul-ureticisi">
                  Unlu mamul üreticisi
                </option>
                <option value="pastane">Pastane işletmecisi</option>
                <option value="lokanta">Lokanta / Restoran işletmecisi</option>
                <option value="donerci">Dönerci / Kebapçı</option>
                <option value="fast-food">Fast food işletmecisi</option>
                <option value="tatlici">Tatlıcı / Baklavacı</option>
                <option value="cigkofteci">Çiğköfteci</option>
                <option value="kahveci">Kahveci</option>
                <option value="cay-ocagi">Çay ocağı işletmecisi</option>
                <option value="bufeci">Büfeci</option>
                <option value="su-bayii">Su bayii</option>
                <option value="dondurmaci">Dondurmacı</option>
                <option value="yufkaci">Yufkacı</option>
                <option value="cafe">Cafe / Kahvehane</option>
                <option value="pastahane">Pastahane</option>
              </optgroup>

              <optgroup label="Ulaşım ve Taşımacılık">
                <option value="taksici">Taksici</option>
                <option value="dolmuscu">Dolmuşçu</option>
                <option value="servis-soforu">Servis aracı işletmecisi</option>
                <option value="nakliyeci">Nakliyeci</option>
                <option value="kamyoncu">Kamyoncu</option>
                <option value="kargo-dagitim">Kargo dağıtım elemanı</option>
                <option value="motorlu-kurye">Motorlu kurye</option>
                <option value="oto-kiralama">Oto kiralama (rent-a-car)</option>
                <option value="minibuscu">Minibüs işletmecisi</option>
                <option value="otobus-soforu">Otobüs şoförü</option>
                <option value="bisikletli-kurye">Bisikletli kurye</option>
              </optgroup>

              <optgroup label="Oto ve Motorlu Araç Hizmetleri">
                <option value="oto-tamircisi">Oto tamircisi</option>
                <option value="oto-elektrikci">Oto elektrikçisi</option>
                <option value="kaportaci">Oto kaportacı</option>
                <option value="oto-boyaci">Oto boya ustası</option>
                <option value="oto-yikamaci">Oto yıkamacı</option>
                <option value="lastikci">Oto lastikçi</option>
                <option value="oto-dosemeci">Oto döşemeci</option>
                <option value="oto-camci">Oto camcı</option>
                <option value="egzozcu">Egzozcu</option>
                <option value="oto-aksesuarci">Oto aksesuarcısı</option>
                <option value="oto-ekspertiz">Oto ekspertiz</option>
                <option value="yedek-parcaci">Oto parçacı / yedek parça</option>
                <option value="motosiklet-tamircisi">
                  Motosiklet tamircisi
                </option>
                <option value="oto-klimaci">Oto klima servisi</option>
              </optgroup>

              <optgroup label="Mobilya ve Ahşap İşleri">
                <option value="mobilya-imalatcisi">Mobilya imalatçısı</option>
                <option value="mobilya-tamircisi">Mobilya tamircisi</option>
                <option value="marangoz">Marangoz</option>
                <option value="ahsap-oymaci">Ahşap oymacısı</option>
                <option value="dogramaci">Kapı/pencere doğramacısı</option>
                <option value="parke-ustasi">Parke ustası</option>
                <option value="mutfak-dolabi-imalatcisi">
                  Mutfak dolabı imalatçısı
                </option>
                <option value="mobilya-boyacisi">Ahşap mobilya boyacısı</option>
                <option value="lake-ustasi">Lake mobilya ustası</option>
              </optgroup>

              <optgroup label="Giyim ve Tekstil">
                <option value="terzi">Terzi</option>
                <option value="erkek-kuaforu">Erkek kuaförü</option>
                <option value="kadin-kuaforu">Kadın kuaförü</option>
                <option value="berber">Berber</option>
                <option value="gelinlikci">Gelinlikçi</option>
                <option value="ceyizci">Çeyizci</option>
                <option value="overlokcu">Overlokçu</option>
                <option value="perdeci">Perdeci</option>
                <option value="ayakkabi-tamircisi">Ayakkabı tamircisi</option>
                <option value="ayakkabi-imalatcisi">Ayakkabı imalatçısı</option>
                <option value="ayakkabi-saticisi">Ayakkabı satıcısı</option>
                <option value="giyim-magazasi">
                  Giyim mağazası işletmecisi
                </option>
                <option value="camasirhane">Çamaşırhane</option>
                <option value="kuru-temizlemeci">Kuru temizlemeci</option>
                <option value="trikocu">Trikocu</option>
                <option value="tekstil-aksesuarcisi">
                  Tekstil aksesuarcısı
                </option>
                <option value="magaza-ticaret">Mağaza ticareti</option>
                <option value="otomotiv-onarim">Otomotiv onarımı</option>
                <option value="bilgisayar-onarim">
                  Bilgisayar / elektrikli cihaz onarımı
                </option>
                <option value="mobilya-tamir">Mobilya tamiri</option>
                <option value="tekstik-onarim">Tekstil / giyim onarımı</option>
                <option value="berber-kuafor">Berber / kuaför hizmeti</option>
                <option value="guzellik-hizmetleri">
                  Güzellik & bakım hizmetleri
                </option>
                <option value="organizasyon-hizmeti">
                  Organizasyon hizmetleri
                </option>
              </optgroup>

              <optgroup label="Sağlık ve Kişisel Bakım">
                <option value="gozlukcu">Gözlükçü</option>
                <option value="eczane-teknikeri">Eczane teknikeri</option>
                <option value="medikal-satici">Medikal ürün satıcısı</option>
                <option value="masoz">Masöz</option>
                <option value="guzellik-salonu">
                  Güzellik salonu işletmecisi
                </option>
                <option value="estetisyen">Estetisyen</option>
                <option value="tibbi-cihaz-teknisyeni">
                  Tıbbi cihaz bakım-onarımcısı
                </option>
                <option value="eczacilik">Eczacılık</option>
                <option value="dis-hekimligi">Diş hekimliği</option>
                <option value="optik-hizmetleri">Optik hizmetleri</option>
                <option value="medikal-cihaz-servisi">
                  Medikal cihaz servisi
                </option>
                <option value="kuafor-guzellik">Kuaför & Güzellik</option>
              </optgroup>

              <optgroup label="İnşaat ve Yapı Sektörü">
                <option value="insaat-ustasi">İnşaat ustası</option>
                <option value="kalip-ustasi">Kalıp ustası</option>
                <option value="duvar-ustasi">Duvar ustası</option>
                <option value="boyaci-badanaci">Boyacı / Badanacı</option>
                <option value="sihhi-tesisatci">Sıhhi tesisatçı</option>
                <option value="elektrikci">Elektrikçi</option>
                <option value="alcipan-ustasi">Alçıpan ustası</option>
                <option value="fayans-seramik-ustasi">
                  Fayans / Seramik ustası
                </option>
                <option value="pvc-dograma-ustasi">PVC doğrama ustası</option>
                <option value="camci">Camcı</option>
                <option value="cati-ustasi">Çatı ustası</option>
                <option value="demir-dogramaci">Demir doğramacı</option>
                <option value="asma-tavan-ustasi">Asma tavan ustası</option>
                <option value="kombici-kaloriferci">
                  Kombici / kaloriferci
                </option>
              </optgroup>

              <optgroup label="Elektrik - Elektronik - Teknoloji">
                <option value="telefon-tamircisi">Telefon tamircisi</option>
                <option value="bilgisayar-tamircisi">
                  Bilgisayar tamircisi
                </option>
                <option value="televizyon-tamircisi">
                  Televizyon tamircisi
                </option>
                <option value="beyaz-esya-tamircisi">
                  Beyaz eşya tamircisi
                </option>
                <option value="elektrikci-ev-is-yeri">
                  Elektrikçi (ev/işyeri)
                </option>
                <option value="kamera-alarm-sistemleri">
                  Kamera - alarm sistemleri
                </option>
                <option value="uydu-sistemleri-tamircisi">
                  Uydu sistemleri tamircisi
                </option>
              </optgroup>

              <optgroup label="Kırtasiye ve Eğitim">
                <option value="kirtasiyeci">Kırtasiyeci</option>
                <option value="fotokopici">Fotokopici</option>
                <option value="kitapci">Kitapçı</option>
                <option value="egitim-danismanligi">Eğitim danışmanlığı</option>
                <option value="etut-merkezi">Etüt merkezi işletmecisi</option>
                <option value="bilgisayar-kursu">Bilgisayar kursu</option>
              </optgroup>

              <optgroup label="Zanaatkâr ve El Sanatları">
                <option value="kalayci">Kalaycı</option>
                <option value="bakirci">Bakırcı</option>
                <option value="cam-ustasi">Cam ustası</option>
                <option value="seramik-ustasi">Seramik ustası</option>
                <option value="comlekci">Çömlekçi</option>
                <option value="taki-tasarimcisi">Takı tasarımcısı</option>
                <option value="derici">Derici</option>
                <option value="oyuncak-yapimcisi">Oyuncak yapımcısı</option>
              </optgroup>

              <optgroup label="Tarım ve Hayvancılık">
                <option value="sutcu">Sütçü</option>
                <option value="ciftci">Çiftçi</option>
                <option value="yumurta-saticisi">Yumurta satıcısı</option>
                <option value="tohum-fide-saticisi">
                  Tohum / fide satıcısı
                </option>
                <option value="hayvan-yemi-saticisi">
                  Hayvan yemi satıcısı
                </option>
                <option value="arici">Arıcı</option>
                <option value="cicekci">Çiçekçi</option>
              </optgroup>

              <optgroup label="Genel Hizmetler">
                <option value="temizlik-hizmetleri">Temizlik hizmetleri</option>
                <option value="hali-yikamaci">Halı yıkamacı</option>
                <option value="koltuk-yikamaci">Koltuk yıkamacı</option>
                <option value="dezenfekte-hizmetleri">
                  Dezenfekte hizmetleri
                </option>
                <option value="organizasyon-hizmetleri">
                  Organizasyon hizmetleri
                </option>
                <option value="dugun-salonu-isletmecisi">
                  Düğün salonu işletmecisi
                </option>
                <option value="fotografci">Fotoğrafçı</option>
                <option value="matbaaci">Matbaacı</option>
                <option value="tercuman">Tercüman</option>
                <option value="seyyar-satici">Seyyar satıcı</option>
                <option value="danismanlik-ofisi">Danışmanlık ofisi</option>
                <option value="cilingir-anahtarcı">Çilingir / Anahtarcı</option>
              </optgroup>

              <optgroup label="Eğlence ve Kültür">
                <option value="internet-kafe">İnternet kafe</option>
                <option value="playstation-kafe">PlayStation kafe</option>
                <option value="kutuphane-kitap-evi">
                  Kütüphane / kitap evi
                </option>
                <option value="sinema-tiyatro">
                  Sinema / tiyatro işletmecisi
                </option>
                <option value="muzik-aletleri-saticisi">
                  Müzik aletleri satıcısı
                </option>
                <option value="plak-cd-dukkani">Plak / CD dükkanı</option>
              </optgroup>

              <optgroup label="Hayvan Hizmetleri">
                <option value="pet-shop">Pet shop</option>
                <option value="veteriner-teknikeri">Veteriner teknikeri</option>
                <option value="hayvan-kuaforu">Hayvan kuaförü</option>
                <option value="mama-ve-aksesuar-saticisi">
                  Mama ve aksesuar satıcısı
                </option>
              </optgroup>

              <optgroup label="Diğer">
                <option value="noter-disi-kirtasiye-isleri">
                  Noter dışı kırtasiye işleri
                </option>
                <option value="tapu-takip-isleri">Tapu takip işleri</option>
                <option value="kuryelik">Kuryelik</option>
                <option value="emlak-danismani">Emlak danışmanı</option>
                <option value="sigorta-acentasi">Sigorta acentesi</option>
                <option value="oyun-salonu-isletmecisi">
                  Oyun salonu işletmecisi
                </option>
                <option value="gumuscu-kuyum-tamircisi">
                  Gümüşçü / Kuyum tamircisi
                </option>
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
