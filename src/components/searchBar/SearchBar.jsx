import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./searchBar.scss";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";
import { useCategories } from "../../lib/useCategories";

function SearchBar() {
  // "campaign" → /list (kampanyalar), "business" → /isletmeler (işletme rehberi)
  const [mode, setMode] = useState("campaign");
  const [businessName, setBusinessName] = useState("");
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
    if (mode === "business") {
      // İşletme rehberi filtreleri: city, district, category (id), search (ad)
      const params = new URLSearchParams();
      if (query.city) params.set("city", query.city);
      if (query.district) params.set("district", query.district);
      if (query.type) params.set("category", query.type);
      if (businessName.trim()) params.set("search", businessName.trim());
      const qs = params.toString();
      navigate(qs ? `/isletmeler?${qs}` : "/isletmeler");
      return;
    }
    navigate(
      `/list?categoryId=${query.type}&city=${query.city}&district=${query.district}`,
    );
  };

  return (
    <form
      className="form-wrapper"
      onSubmit={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      {/* Arama türü: Kampanya / İşletme */}
      <div className="search-mode" role="tablist" aria-label="Arama türü">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "campaign"}
          className={mode === "campaign" ? "active" : ""}
          onClick={() => setMode("campaign")}
        >
          Kampanya
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "business"}
          className={mode === "business" ? "active" : ""}
          onClick={() => setMode("business")}
        >
          İşletme
        </button>
      </div>

      {mode === "business" && (
        <input
          type="text"
          className="business-name-input"
          aria-label="İşletme adı"
          placeholder="İşletme adı ara (örn. Akasya Diş)"
          value={businessName}
          maxLength={60}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      )}

      {/* İl ve İlçe */}
      <div className="city-district">
        <select
          name="city"
          aria-label="Şehir seçin"
          value={query.city}
          onChange={handleChange}
        >
          <option value="">Şehir Seçiniz</option>
          {cities.map((city, index) => (
            <option key={index} value={city.il_adi}>
              {city.il_adi}
            </option>
          ))}
        </select>

        <select
          name="district"
          aria-label="İlçe seçin"
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
      <select
        id="type"
        name="type"
        aria-label="Kategori seçin"
        onChange={handleChange}
        value={query.type}
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
      {/* Arama Butonu */}
      <button type="submit" className="form-button">
        <img src="/search.png" alt="" />
        <span>{mode === "business" ? "İşletme Ara" : "Ara"}</span>
      </button>
    </form>
  );
}

export default SearchBar;
