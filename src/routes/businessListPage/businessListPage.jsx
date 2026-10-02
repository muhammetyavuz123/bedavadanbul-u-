import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiMapPin, FiPhone, FiSearch, FiBriefcase, FiNavigation } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import Loader from "../../components/loader/Loader";
import StarRating from "../../components/StarRating/StarRating";
import BizAvatar from "../../components/BizAvatar/BizAvatar";
import CategorySelect from "../../components/CategorySelect/CategorySelect";
import apiRequest from "../../lib/apiRequest";
import { formatPhone, telHref } from "../../lib/formatPhone";
import { slugify, cityPath, districtPath } from "../../lib/slug";
import { VerifiedBadge, FeaturedBadge } from "../../components/BizBadges/BizBadges";
import { AuthContext } from "../../context/AuthContext";
import "./businessListPage.scss";

const PAGE_SIZE = 12;

function BusinessListPage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { citySlug, districtSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);

  // /isletmeler/:il/:ilce biçimindeki SEO dostu adresler: slug -> gerçek ad.
  // Eski ?city=...&district=... biçimi de çalışmaya devam eder.
  const pathCity = useMemo(
    () => (citySlug ? cities.find((c) => slugify(c.il_adi) === citySlug)?.il_adi || "" : ""),
    [citySlug, cities],
  );
  const pathDistrict = useMemo(
    () =>
      districtSlug
        ? districts.find((d) => slugify(d.ilce_adi) === districtSlug)?.ilce_adi || ""
        : "",
    [districtSlug, districts],
  );
  const city = citySlug ? pathCity : searchParams.get("city") || "";
  const district = districtSlug ? pathDistrict : searchParams.get("district") || "";
  // Adres çubuğundaki slug henüz gerçek isme çözülmedi (il/ilçe listesi yükleniyor)
  const resolvingPath =
    (!!citySlug && cities.length === 0) || (!!districtSlug && !!pathCity && districts.length === 0);
  const unknownPlace =
    (!!citySlug && cities.length > 0 && !pathCity) ||
    (!!districtSlug && !!pathCity && districts.length > 0 && !pathDistrict);
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const minRating = searchParams.get("minRating") || "";
  const sort = searchParams.get("sort") || "";

  const [searchText, setSearchText] = useState(search);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtre seçenekleri
  useEffect(() => {
    apiRequest.get("/locations").then((r) => setCities(r.data)).catch(() => {});
    apiRequest.get("/businesses/places").then((r) => setPlaces(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      return;
    }
    setDistricts([]);
    apiRequest
      .get(`/locations/${encodeURIComponent(city)}`)
      .then((r) => setDistricts(r.data))
      .catch(() => setDistricts([]));
  }, [city]);

  useEffect(() => setSearchText(search), [search]);

  // Filtre değişince listeyi baştan yükle
  useEffect(() => {
    if (resolvingPath || unknownPlace) {
      if (unknownPlace) {
        setItems([]);
        setTotal(0);
        setLoading(false);
      }
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE) });
    if (city) query.set("city", city);
    if (district) query.set("district", district);
    if (category) query.set("category", category);
    if (search) query.set("search", search);
    if (minRating) query.set("minRating", minRating);
    if (sort) query.set("sort", sort);

    apiRequest
      .get(`/businesses?${query.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.data);
        setTotal(res.data.total);
        setPage(1);
      })
      .catch(() => {
        if (!cancelled) setError("İşletmeler yüklenemedi. Lütfen tekrar deneyin.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [city, district, category, search, minRating, sort, resolvingPath, unknownPlace]);

  const loadMore = async () => {
    const next = page + 1;
    const query = new URLSearchParams({ page: String(next), limit: String(PAGE_SIZE) });
    if (city) query.set("city", city);
    if (district) query.set("district", district);
    if (category) query.set("category", category);
    if (search) query.set("search", search);
    if (minRating) query.set("minRating", minRating);
    if (sort) query.set("sort", sort);
    setLoading(true);
    try {
      const res = await apiRequest.get(`/businesses?${query.toString()}`);
      setItems((prev) => [...prev, ...res.data.data]);
      setTotal(res.data.total);
      setPage(next);
    } catch {
      setError("Daha fazla işletme yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Konum filtreleri SEO dostu path adreslerine (/isletmeler/istanbul/kadikoy) taşınır;
  // diğer filtreler (kategori, puan, sıralama, arama) query olarak kalır.
  const goPlace = (nextCity, nextDistrict) => {
    const rest = new URLSearchParams(searchParams);
    rest.delete("city");
    rest.delete("district");
    const qs = rest.toString();
    let pathname = "/isletmeler";
    if (nextCity) pathname = nextDistrict ? districtPath(nextCity, nextDistrict) : cityPath(nextCity);
    navigate({ pathname, search: qs ? `?${qs}` : "" });
  };

  const setParam = (key, value) => {
    if (key === "city") return goPlace(value, "");
    if (key === "district") return goPlace(city, value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => navigate("/isletmeler");

  const submitSearch = (e) => {
    e.preventDefault();
    setParam("search", searchText.trim());
  };

  const hasFilters = city || district || category || search || minRating || sort;

  // Bölge / SEO başlıkları
  const placeLabel = district ? `${district}, ${city}` : city;
  const pageTitle = placeLabel ? `${placeLabel} İşletmeleri` : "İşletmeler";
  const metaDescription = placeLabel
    ? `${placeLabel} bölgesindeki işletmeleri BedavadanBul'da keşfet: puanlar, yorumlar, çalışma saatleri ve işletmelere özel soru sorma.`
    : "BedavadanBul'da şehrindeki işletmeleri keşfet: puanlar, yorumlar, kampanyalar ve işletmelere özel soru sorma.";
  const canonical =
    district && city
      ? `https://bedavadanbul.com${districtPath(city, district)}`
      : city
        ? `https://bedavadanbul.com${cityPath(city)}`
        : "https://bedavadanbul.com/isletmeler";

  // "Bölgemdeki işletmeler": hesabındaki il/ilçe
  const myCity = currentUser?.city || "";
  const myDistrict = currentUser?.district || "";
  const showNearMe = !!myCity && !(city === myCity && (!myDistrict || district === myDistrict));

  const activePlace = places.find((p) => p.city === city);
  const placeLinks = city
    ? (activePlace?.districts || []).slice(0, 24).map((d) => ({
        key: d.district,
        to: districtPath(city, d.district),
        label: d.district,
        count: d.count,
      }))
    : places.slice(0, 24).map((p) => ({
        key: p.city,
        to: cityPath(p.city),
        label: p.city,
        count: p.count,
      }));

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} | BedavadanBul`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Breadcrumb
        title={pageTitle}
        breadcrumbText={`Anasayfa / İşletmeler${city ? ` / ${city}` : ""}${district ? ` / ${district}` : ""}`}
        backgroundImage={BreadcrumbImage}
      />

      <div className="bizList">
        <aside className="bizFilters">
          <h2>
            <FiSearch /> İşletme Ara
          </h2>

          <form onSubmit={submitSearch} className="bizSearchForm">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="İşletme adı..."
              maxLength={60}
            />
            <button type="submit">Ara</button>
          </form>

          <label>Kategori</label>
          <CategorySelect
            value={category}
            onChange={(e) => setParam("category", e.target.value)}
          />

          <label>İl</label>
          <select value={city} onChange={(e) => setParam("city", e.target.value)}>
            <option value="">Tümü</option>
            {cities.map((c) => (
              <option key={c.il_adi} value={c.il_adi}>
                {c.il_adi}
              </option>
            ))}
          </select>

          <label>İlçe</label>
          <select
            value={district}
            onChange={(e) => setParam("district", e.target.value)}
            disabled={!city}
          >
            <option value="">{city ? "Tümü" : "Önce il seçin"}</option>
            {districts.map((d) => (
              <option key={d.ilce_adi} value={d.ilce_adi}>
                {d.ilce_adi}
              </option>
            ))}
          </select>

          <label>Minimum puan</label>
          <select value={minRating} onChange={(e) => setParam("minRating", e.target.value)}>
            <option value="">Tümü</option>
            <option value="3">3 ve üzeri</option>
            <option value="4">4 ve üzeri</option>
            <option value="4.5">4.5 ve üzeri</option>
          </select>

          <label>Sıralama</label>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value)}>
            <option value="">En yeni</option>
            <option value="rating">En yüksek puan</option>
            <option value="reviews">En çok yorum</option>
          </select>

          {hasFilters && (
            <button type="button" className="clearBtn" onClick={clearFilters}>
              Filtreleri temizle
            </button>
          )}
        </aside>

        <main className="bizResults">
          <div className="bizResultsHead">
            <p>{loading && items.length === 0 ? "Yükleniyor..." : `${total} işletme bulundu`}</p>
            {showNearMe && (
              <button
                type="button"
                className="nearMeBtn"
                onClick={() => goPlace(myCity, myDistrict)}
              >
                <FiNavigation /> Bölgemdeki işletmeler
              </button>
            )}
            {currentUser?.role === "business" && (
              <Link to="/profile?tab=business" className="myBizLink">
                İşletme panelim
              </Link>
            )}
          </div>

          {error && <p className="bizError">{error}</p>}

          {unknownPlace && (
            <div className="bizEmpty">
              <FiMapPin />
              <p>
                Bu bölge bulunamadı. <Link to="/isletmeler">Tüm işletmelere dön</Link>
              </p>
            </div>
          )}

          <div className="bizGrid">
            {items.map((b) => (
              <article key={b.id} className={`bizCard ${b.isFeatured ? "isFeatured" : ""}`}>
                <Link to={`/isletme/${b.id}`} className="bizCardMain">
                  <div className="bizLogo">
                    <BizAvatar name={b.name} logo={b.logo} />
                  </div>
                  <div className="bizInfo">
                    {b.isFeatured && <FeaturedBadge className="cardFeatured" />}
                    <h3>
                      {b.name} {b.isVerified && <VerifiedBadge compact />}
                    </h3>
                    <span className="bizCategory">{b.category?.name}</span>
                    <div className="bizRating">
                      <StarRating value={b.ratingAvg} size={15} />
                      <span>
                        {b.ratingCount > 0
                          ? `${b.ratingAvg.toFixed(1)} (${b.ratingCount})`
                          : "Henüz yorum yok"}
                      </span>
                    </div>
                    <p className="bizLocation">
                      <FiMapPin /> {b.district}, {b.city}
                    </p>
                    {b.description && <p className="bizDesc">{b.description}</p>}
                  </div>
                </Link>
                <div className="bizActions">
                  <a href={telHref(b.phone)} className="callBtn">
                    <FiPhone /> {formatPhone(b.phone)}
                  </a>
                  <Link to={`/isletme/${b.id}`} className="viewBtn">
                    Profili gör
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {loading && items.length > 0 && <Loader />}
          {loading && items.length === 0 && <Loader />}

          {!loading && !error && !unknownPlace && items.length === 0 && (
            <div className="bizEmpty">
              <FiBriefcase />
              <p>Bu filtrelere uygun işletme bulunamadı.</p>
            </div>
          )}

          {!loading && items.length < total && (
            <div className="bizMore">
              <button type="button" onClick={loadMore}>
                Daha Fazla Yükle
              </button>
            </div>
          )}

          {placeLinks.length > 0 && (
            <section className="placeLinks">
              <h2>{city ? `${city} ilçelerine göre işletmeler` : "Şehre göre işletmeler"}</h2>
              <div className="placeChips">
                {city && (
                  <Link to="/isletmeler" className="chip">
                    Tüm Türkiye
                  </Link>
                )}
                {placeLinks.map((l) => (
                  <Link key={l.key} to={l.to} className="chip">
                    {l.label} <small>{l.count}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default BusinessListPage;
