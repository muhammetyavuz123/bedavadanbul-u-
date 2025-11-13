import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./searchBar.scss";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";

function SearchBar() {
  const [query, setQuery] = useState({
    type: "",
    city: "",
    district: "",
  });
  const { showError } = useError();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

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
      `/list?type=${query.type}&city=${query.city}&district=${query.district}`
    );
  };

  return (
    <form className="form-wrapper">
      {/* Şehir */}
      <select name="city" value={query.city} onChange={handleChange}>
        <option value="">Lütfen Şehir Seçiniz</option>
        {cities.map((city, index) => (
          <option key={index} value={city?.il_adi}>
            {city?.il_adi}
          </option>
        ))}
      </select>

      {/* İlçe */}
      <select
        name="district"
        value={query.district}
        onChange={handleChange}
        disabled={!query.city}
      >
        <option value="">Lütfen İlçe Seçiniz</option>
        {districts.map((district, index) => (
          <option key={index} value={district?.ilce_adi}>
            {district?.ilce_adi}
          </option>
        ))}
      </select>

      {/* Kategori */}
      <select name="type" value={query.type} onChange={handleChange}>
        <optgroup label="Gıda ve Market Esnafı">
          <option value="bakkal">Bakkal</option>
          <option value="market">Market işletmecisi</option>
          <option value="manav">Manav</option>
          <option value="kasap">Kasap</option>
          <option value="sarkuteri">Şarküteri</option>
          <option value="kuruyemisci">Kuruyemişçi</option>
          <option value="balikci">Balıkçı</option>
          <option value="firinci">Fırıncı / Ekmekçi</option>
          <option value="unlu-mamul-ureticisi">Unlu mamul üreticisi</option>
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
          <option value="motosiklet-tamircisi">Motosiklet tamircisi</option>
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
          <option value="giyim-magazasi">Giyim mağazası işletmecisi</option>
          <option value="camasirhane">Çamaşırhane</option>
          <option value="kuru-temizlemeci">Kuru temizlemeci</option>
          <option value="trikocu">Trikocu</option>
          <option value="tekstil-aksesuarcisi">Tekstil aksesuarcısı</option>
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
          <option value="organizasyon-hizmeti">Organizasyon hizmetleri</option>
        </optgroup>

        <optgroup label="Sağlık ve Kişisel Bakım">
          <option value="gozlukcu">Gözlükçü</option>
          <option value="eczane-teknikeri">Eczane teknikeri</option>
          <option value="medikal-satici">Medikal ürün satıcısı</option>
          <option value="masoz">Masöz</option>
          <option value="guzellik-salonu">Güzellik salonu işletmecisi</option>
          <option value="estetisyen">Estetisyen</option>
          <option value="tibbi-cihaz-teknisyeni">
            Tıbbi cihaz bakım-onarımcısı
          </option>
          <option value="eczacilik">Eczacılık</option>
          <option value="dis-hekimligi">Diş hekimliği</option>
          <option value="optik-hizmetleri">Optik hizmetleri</option>
          <option value="medikal-cihaz-servisi">Medikal cihaz servisi</option>
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
          <option value="fayans-seramik-ustasi">Fayans / Seramik ustası</option>
          <option value="pvc-dograma-ustasi">PVC doğrama ustası</option>
          <option value="camci">Camcı</option>
          <option value="cati-ustasi">Çatı ustası</option>
          <option value="demir-dogramaci">Demir doğramacı</option>
          <option value="asma-tavan-ustasi">Asma tavan ustası</option>
          <option value="kombici-kaloriferci">Kombici / kaloriferci</option>
        </optgroup>

        <optgroup label="Elektrik - Elektronik - Teknoloji">
          <option value="telefon-tamircisi">Telefon tamircisi</option>
          <option value="bilgisayar-tamircisi">Bilgisayar tamircisi</option>
          <option value="televizyon-tamircisi">Televizyon tamircisi</option>
          <option value="beyaz-esya-tamircisi">Beyaz eşya tamircisi</option>
          <option value="elektrikci-ev-is-yeri">Elektrikçi (ev/işyeri)</option>
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
          <option value="tohum-fide-saticisi">Tohum / fide satıcısı</option>
          <option value="hayvan-yemi-saticisi">Hayvan yemi satıcısı</option>
          <option value="arici">Arıcı</option>
          <option value="cicekci">Çiçekçi</option>
        </optgroup>

        <optgroup label="Genel Hizmetler">
          <option value="temizlik-hizmetleri">Temizlik hizmetleri</option>
          <option value="hali-yikamaci">Halı yıkamacı</option>
          <option value="koltuk-yikamaci">Koltuk yıkamacı</option>
          <option value="dezenfekte-hizmetleri">Dezenfekte hizmetleri</option>
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
          <option value="kutuphane-kitap-evi">Kütüphane / kitap evi</option>
          <option value="sinema-tiyatro">Sinema / tiyatro işletmecisi</option>
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

      {/* Arama Butonu */}
      <button type="button" className="form-button" onClick={handleClick}>
        <img src="/search.png" alt="Ara" />
      </button>
    </form>
  );
}

export default SearchBar;
