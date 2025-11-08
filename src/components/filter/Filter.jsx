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

        {/* 🏷️ Kategori */}
        <div className="filter-group">
          <label htmlFor="type">Kategori</label>
          <div className="select-wrapper">
            <select
              id="type"
              name="type"
              onChange={handleChange}
              value={query.type}
            >
              <option value="">Tümü</option>
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
