import { useState, useEffect } from "react";
import "./filter.scss";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
  });
  const [cities, setCities] = useState([]);
  const [district, setDistrict] = useState([]);

  const handleChange = (e) => {
    setQuery({
      ...query,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilter = () => {
    setSearchParams(query);
  };

  useEffect(() => {
    async function citiesCall() {
      try {
        const cities = await apiRequest.get("/locations");
        setCities(cities.data);
      } catch (error) {
        console.log("🚀 ~ SearchBar ~ error:", error);
      }
    }
    citiesCall();
  }, []);

  useEffect(() => {
    async function districhCall() {
      if (query.city) {
        try {
          const cities = await apiRequest.get(`/locations/${query.city}`);
          setDistrict(cities.data);
        } catch (error) {
          console.log("🚀 ~ SearchBar ~ error:", error);
        }
      }
    }

    districhCall();
  }, [query.city]);

  return (
    <>
      {/* <h1>
        Arama Sonuç: <b>{searchParams.get("city")}</b>
      </h1> */}
      <div className="filters">
        <div className="FilterBar">
          <form>
            <select
              type="text"
              id="city"
              name="city"
              placeholder="City"
              onChange={handleChange}
              defaultValue={query.city}
            >
              <option value={query.city ? query.city : ""}>
                {query.city ? query.city : "Tümü"}
              </option>
              {cities.length > 0 &&
                cities?.map((city, index) => (
                  <option key={index} value={city?.il_adi}>
                    {city?.il_adi}
                  </option>
                ))}
            </select>

            <select
              type="text"
              id="district"
              name="district"
              onChange={handleChange}
              defaultValue={query.district}
            >
              <option value={query.district ? query.district : ""}>
                {query.district ? query.district : "Tümü"}
              </option>
              {district.length > 0 &&
                district?.map((districh, index) => (
                  <option key={index} value={districh?.ilce_adi}>
                    {districh?.ilce_adi}
                  </option>
                ))}
            </select>
            <select
              name="type"
              id="type"
              onChange={handleChange}
              defaultValue={query.type}
            >
              <option value={query.type ? query.type : ""}>
                {query.type ? query.type : "Tümü"}
              </option>
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
            <button onClick={handleFilter}>
              <img src="/search.png" alt="" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Filter;
