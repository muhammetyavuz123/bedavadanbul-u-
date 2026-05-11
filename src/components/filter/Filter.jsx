import { useState, useEffect } from "react";
import "./filter.scss";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState({
    categoryId: searchParams.get("categoryId") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
  });

  const { showError } = useError();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // ✅ KATEGORİLER
  const [categories, setCategories] = useState([]);

  // 🔥 SADECE ANA KATEGORİLER
  const mainCategories = categories.filter((c) => !c.parentId);

  // 🔥 ALT KATEGORİ GETİR
  const getSubCategories = (parentId) => {
    return categories.filter((c) => c.parentId === parentId);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setQuery((prev) => ({
        ...prev,
        city: value,
        district: "",
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

    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== ""),
    );

    setSearchParams(cleanQuery);
  };

  const clearField = (field) => {
    if (field === "city") {
      setQuery((prev) => ({
        ...prev,
        city: "",
        district: "",
      }));
    } else {
      setQuery((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // ✅ ŞEHİRLER
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await apiRequest.get("/locations");
        setCities(res.data);
      } catch (error) {
        showError("Şehir verisi alınırken bir hata oluştu.");
      }
    }

    fetchCities();
  }, []);

  // ✅ İLÇELER
  useEffect(() => {
    async function fetchDistricts() {
      if (query.city) {
        try {
          const res = await apiRequest.get(`/locations/${query.city}`);
          setDistricts(res.data);
        } catch (error) {
          showError("İlçe verisi alınırken bir hata oluştu.");
        }
      } else {
        setDistricts([]);
      }
    }

    fetchDistricts();
  }, [query.city]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiRequest.get("/categories");
        setCategories(res.data);
      } catch (error) {
        showError("Kategori verisi alınırken hata oluştu.");
      }
    }

    fetchCategories();
  }, []);
  return (
    <div className="filter-container">
      <form className="filter-form" onSubmit={handleFilter}>
        {/* 🔎 ARAMA */}
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

        {/* 🏙️ ŞEHİR */}
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

        {/* 🏘️ İLÇE */}
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

        {/* ✅ KATEGORİ */}
        <div className="filter-group">
          <label htmlFor="categoryId">Kategori</label>

          <div className="select-wrapper">
            <select
              id="categoryId"
              name="categoryId"
              onChange={handleChange}
              value={query.categoryId}
            >
              <option value="">Kategori Seçin</option>

              {mainCategories.map((main) => {
                const subCategories = getSubCategories(main.id);

                return (
                  <optgroup key={main.id} label={main.name}>
                    {/* TÜMÜ */}
                    <option value={main.id}>Tümü ({main.name})</option>

                    {/* ALT KATEGORİLER */}
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            {query.categoryId && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearField("categoryId")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 🔘 BUTTON */}
        <button type="submit" className="search-btn">
          <img src="/search.png" alt="Ara" />
          Filtrele
        </button>
      </form>
    </div>
  );
}

export default Filter;
