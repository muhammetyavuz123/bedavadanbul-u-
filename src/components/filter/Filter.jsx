import { useState, useEffect } from "react";
import "./filter.scss";
import "./campaignFilter.scss";
import { useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiNavigation,
  FiGrid,
  FiChevronDown,
  FiSliders,
  FiX,
} from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import { useError } from "../../context/ErrorContext";

const FIELDS = ["categoryId", "city", "district", "search"];

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState({
    categoryId: searchParams.get("categoryId") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
  });

  // Küçük ekranlarda filtre alanları açılır/kapanır (masaüstünde hep açık)
  const [open, setOpen] = useState(false);

  const { showError } = useError();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);

  const mainCategories = categories.filter((c) => !c.parentId);
  const getSubCategories = (parentId) => categories.filter((c) => c.parentId === parentId);

  // Uygulanmış (adres çubuğundaki) filtreler: üstteki çipler bunlardan çizilir
  const applied = {
    categoryId: searchParams.get("categoryId") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
  };
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "Kategori";
  const activeCount = FIELDS.filter((f) => applied[f]).length;

  // Adres çubuğu dışarıdan değişirse (geri tuşu, "Tümünü gör" vb.) form da güncellensin
  useEffect(() => {
    setQuery({
      categoryId: searchParams.get("categoryId") || "",
      city: searchParams.get("city") || "",
      district: searchParams.get("district") || "",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  const apply = (next) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([_, v]) => v !== ""));
    setSearchParams(clean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      setQuery((prev) => ({ ...prev, city: value, district: "" }));
    } else {
      setQuery((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    apply(query);
    setOpen(false);
  };

  // Çipteki ✕: o filtreyi kaldırıp hemen uygular
  const removeApplied = (field) => {
    const next = { ...applied, [field]: "" };
    if (field === "city") next.district = "";
    setQuery(next);
    apply(next);
  };

  const resetAll = () => {
    const empty = { categoryId: "", city: "", district: "", search: "" };
    setQuery(empty);
    apply(empty);
  };

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

  useEffect(() => {
    async function fetchDistricts() {
      if (query.city) {
        try {
          const res = await apiRequest.get(`/locations/${encodeURIComponent(query.city)}`);
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

  const chips = [
    applied.search && { field: "search", label: `“${applied.search}”` },
    applied.city && { field: "city", label: applied.city },
    applied.district && { field: "district", label: applied.district },
    applied.categoryId && { field: "categoryId", label: categoryName(applied.categoryId) },
  ].filter(Boolean);

  return (
    <div className="cf">
      <div className="cf-head">
        <div className="cf-title">
          <FiSliders />
          <span>Filtreler</span>
          {activeCount > 0 && <span className="cf-badge">{activeCount}</span>}
        </div>

        {activeCount > 0 && (
          <button type="button" className="cf-reset" onClick={resetAll}>
            Temizle
          </button>
        )}

        <button
          type="button"
          className={open ? "cf-toggle open" : "cf-toggle"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Gizle" : "Düzenle"} <FiChevronDown />
        </button>
      </div>

      {chips.length > 0 && (
        <div className="cf-chips">
          {chips.map((c) => (
            <span className="cf-chip" key={c.field}>
              {c.label}
              <button
                type="button"
                aria-label={`${c.label} filtresini kaldır`}
                onClick={() => removeApplied(c.field)}
              >
                <FiX />
              </button>
            </span>
          ))}
        </div>
      )}

      <form className={open ? "cf-form open" : "cf-form"} onSubmit={handleFilter}>
        <div className="cf-field">
          <label htmlFor="cf-search">Arama</label>
          <div className="cf-control">
            <FiSearch className="cf-ico" />
            <input
              id="cf-search"
              type="text"
              placeholder="Kampanya ya da işletme ara"
              value={query.search}
              name="search"
              onChange={handleChange}
              autoComplete="off"
            />
            {query.search && (
              <button
                type="button"
                className="cf-clear"
                aria-label="Aramayı temizle"
                onClick={() => setQuery((p) => ({ ...p, search: "" }))}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="cf-field">
          <label htmlFor="city">Şehir</label>
          <div className="cf-control">
            <FiMapPin className="cf-ico" />
            <select id="city" name="city" onChange={handleChange} value={query.city}>
              <option value="">Tüm şehirler</option>
              {cities.map((city, i) => (
                <option key={i} value={city?.il_adi}>
                  {city?.il_adi}
                </option>
              ))}
            </select>
            <FiChevronDown className="cf-chev" />
          </div>
        </div>

        <div className="cf-field">
          <label htmlFor="district">İlçe</label>
          <div className={query.city ? "cf-control" : "cf-control disabled"}>
            <FiNavigation className="cf-ico" />
            <select
              id="district"
              name="district"
              onChange={handleChange}
              value={query.district}
              disabled={!query.city}
            >
              <option value="">{query.city ? "Tüm ilçeler" : "Önce şehir seçin"}</option>
              {districts.map((d, i) => (
                <option key={i} value={d?.ilce_adi}>
                  {d?.ilce_adi}
                </option>
              ))}
            </select>
            <FiChevronDown className="cf-chev" />
          </div>
        </div>

        <div className="cf-field">
          <label htmlFor="categoryId">Kategori</label>
          <div className="cf-control">
            <FiGrid className="cf-ico" />
            <select
              id="categoryId"
              name="categoryId"
              onChange={handleChange}
              value={query.categoryId}
            >
              <option value="">Tüm kategoriler</option>
              {mainCategories.map((main) => {
                const subCategories = getSubCategories(main.id);
                return (
                  <optgroup key={main.id} label={main.name}>
                    <option value={main.id}>Tümü ({main.name})</option>
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <FiChevronDown className="cf-chev" />
          </div>
        </div>

        <button type="submit" className="cf-submit">
          <FiSearch /> Sonuçları Göster
        </button>
      </form>
    </div>
  );
}

export default Filter;
