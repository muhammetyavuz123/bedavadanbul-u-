import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiInbox,
  FiBriefcase,
  FiExternalLink,
  FiX,
  FiClock,
  FiAlertCircle,
  FiGift,
  FiCheck,
  FiImage,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import InquiryInbox from "../../components/InquiryInbox/InquiryInbox";
import LoyaltyPanel from "../../components/LoyaltyPanel/LoyaltyPanel";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import Loader from "../../components/loader/Loader";
import CategorySelect from "../../components/CategorySelect/CategorySelect";
import apiRequest from "../../lib/apiRequest";
import { normalizePhone } from "../../lib/normalizePhone";
import { AuthContext } from "../../context/AuthContext";
import "./businessDashboard.scss";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  description: "",
  address: "",
  city: "",
  district: "",
  phone: "",
  website: "",
  workingHours: "",
};

// Profil gücü: hangi bölümler dolu? (işletme sahibine neyi ekleyeceğini gösterir)
function profileStrength(form, logoList, photos) {
  const items = [
    { ok: true, points: 30, label: "Temel bilgiler" },
    { ok: logoList.length > 0, points: 15, label: "Logo ekle" },
    { ok: photos.length >= 3, points: 15, label: "En az 3 fotoğraf ekle" },
    { ok: form.description.trim().length >= 80, points: 15, label: "Açıklamayı detaylandır (en az 80 karakter)" },
    { ok: form.workingHours.trim().length > 0, points: 15, label: "Çalışma saatlerini ekle" },
    { ok: form.website.trim().length > 0, points: 15, label: "Web sitesi ekle" },
  ];
  const score = items.reduce((t, i) => t + (i.ok ? i.points : 0), 0);
  return { score, missing: items.filter((i) => !i.ok) };
}

const initialsOf = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase("tr") || "")
    .join("") || "İ";

function statusInfo(business) {
  if (!business) return { key: "draft", label: "Taslak" };
  if (business.status === "pending") return { key: "pending", label: "İnceleniyor" };
  if (business.status === "rejected") return { key: "rejected", label: "Onaylanmadı" };
  if (business.status === "approved" && !business.isActive)
    return { key: "rejected", label: "Yayında değil" };
  return { key: "live", label: "Yayında" };
}

function BusinessDashboard({ embedded = false }) {
  const { currentUser } = useContext(AuthContext);
  const canManage = currentUser?.role === "business" || currentUser?.role === "admin";

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("inbox");

  const [form, setForm] = useState(EMPTY_FORM);
  const [logoList, setLogoList] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fillFromBusiness = (b) => {
    setForm({
      name: b.name || "",
      categoryId: b.category?.id || "",
      description: b.description || "",
      address: b.address || "",
      city: b.city || "",
      district: b.district || "",
      phone: b.phone || "",
      website: b.website || "",
      workingHours: b.workingHours || "",
    });
    setLogoList(b.logo ? [b.logo] : []);
    setPhotos(b.photos || []);
  };

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }
    // İl listesi ile işletme profili birbirinden bağımsız yüklenir: biri
    // başarısız olsa bile diğeri çalışmaya devam eder.
    apiRequest
      .get("/locations")
      .then((r) => setCities(r.data))
      .catch(() =>
        setMessage({ type: "error", text: "İl listesi yüklenemedi. Sayfayı yenileyin." }),
      );

    apiRequest
      .get("/businesses/me")
      .then((me) => {
        if (me.data) {
          setBusiness(me.data);
          fillFromBusiness(me.data);
        } else {
          setTab("profile"); // henüz profil yoksa önce profil oluşturulsun
          setForm((f) => ({
            ...f,
            name: currentUser?.username || "",
            city: currentUser?.city || "",
            district: currentUser?.district || "",
          }));
        }
      })
      .catch(() => {
        setTab("profile");
        setMessage({
          type: "error",
          text: "İşletme bilgileri alınamadı. API'nin güncel sürümünün çalıştığından emin olun (sunucuyu yeniden başlatın).",
        });
      })
      .finally(() => setLoading(false));
  }, [canManage, currentUser]);

  useEffect(() => {
    if (!form.city) {
      setDistricts([]);
      return;
    }
    apiRequest
      .get(`/locations/${encodeURIComponent(form.city)}`)
      .then((r) => setDistricts(r.data))
      .catch(() => setDistricts([]));
  }, [form.city]);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value, ...(key === "city" ? { district: "" } : {}) }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await apiRequest.put("/businesses/me", {
        ...form,
        phone: normalizePhone(form.phone),
        logo: logoList[logoList.length - 1] || null,
        photos,
      });
      const wasRejected = business?.status === "rejected";
      const wasNew = !business;
      setBusiness(res.data);
      fillFromBusiness(res.data);
      setMessage({
        type: "success",
        text:
          wasRejected || (wasNew && res.data?.status === "pending")
            ? "Başvurunuz yönetici onayına gönderildi."
            : "İşletme profiliniz kaydedildi.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Kaydedilemedi. Lütfen tekrar deneyin.",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadConfig = (folder, multiple) => ({
    multiple,
    cloudName: "difmqapnr",
    uploadPreset: "bedavadanbul",
    folder,
  });

  const st = statusInfo(business);
  const logo = logoList[logoList.length - 1];
  const canView = business && business.status === "approved" && business.isActive;

  return (
    <>
      {!embedded && (
        <Breadcrumb
          title="İşletme Paneli"
          breadcrumbText="Anasayfa / İşletme Paneli"
          backgroundImage={BreadcrumbImage}
        />
      )}

      <div className={embedded ? "bizDash embedded" : "bizDash"}>
        {loading && <Loader />}

        {!loading && !canManage && (
          <div className="dashNotice">
            <FiBriefcase />
            <h2>İşletme paneli sadece işyeri hesaplarına açıktır</h2>
            <p>Bireysel hesaplar işletmelere soru sorabilir ve yorum yapabilir.</p>
            <Link to="/isletmeler">İşletmelere göz at</Link>
          </div>
        )}

        {!loading && canManage && (
          <>
            {/* Kimlik kartı */}
            <section className="bizHero">
              <span className="heroLogo">
                {logo ? <img src={logo} alt="" /> : <b>{initialsOf(form.name)}</b>}
              </span>
              <div className="heroInfo">
                <strong>{business?.name || form.name || "Yeni işletme"}</strong>
                <span className="heroSub">
                  {business
                    ? [business.category?.name, business.district && `${business.district}, ${business.city}`]
                        .filter(Boolean)
                        .join(" · ")
                    : "Profilinizi oluşturup yayına alın"}
                </span>
              </div>
              <span className={`statusPill ${st.key}`}>{st.label}</span>
              {canView && (
                <Link to={`/isletme/${business.id}`} className="viewPublic">
                  Herkese açık sayfa <FiExternalLink />
                </Link>
              )}
            </section>

            {/* Sekmeler */}
            <div className="segTabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "inbox"}
                className={tab === "inbox" ? "active" : ""}
                onClick={() => setTab("inbox")}
                disabled={!business}
              >
                <FiInbox /> <span>Gelen Sorular</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "profile"}
                className={tab === "profile" ? "active" : ""}
                onClick={() => setTab("profile")}
              >
                <FiBriefcase /> <span>İşletme Profili</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "loyalty"}
                className={tab === "loyalty" ? "active" : ""}
                onClick={() => setTab("loyalty")}
                disabled={!business}
              >
                <FiGift /> <span>Sadakat</span>
              </button>
            </div>

            {business?.status === "pending" && (
              <div className="statusBanner pending">
                <FiClock />
                <div>
                  <strong>Başvurunuz inceleniyor</strong>
                  <p>
                    Yönetici onayından sonra profiliniz herkese açık olur ve size
                    bildirim göndeririz. Bu sırada logo, fotoğraf, çalışma saatleri
                    ve açıklamanızı hazırlayabilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {business?.status === "rejected" && (
              <div className="statusBanner rejected">
                <FiAlertCircle />
                <div>
                  <strong>Başvurunuz onaylanmadı</strong>
                  {business.rejectReason && <p>Gerekçe: {business.rejectReason}</p>}
                  <p>
                    Bilgilerinizi düzeltip aşağıdan <b>Düzelt ve yeniden gönder</b> butonuna
                    basarak başvurunuzu tekrar onaya gönderebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {business && business.status === "approved" && !business.isActive && (
              <div className="statusBanner rejected">
                <FiAlertCircle />
                <div>
                  <strong>Profiliniz şu anda yayında değil</strong>
                  <p>Yönetici tarafından yayından kaldırıldı. Ayrıntı için bizimle iletişime geçin.</p>
                </div>
              </div>
            )}

            {!business && (
              <p className="dashHint">
                Müşterilerin sizi bulabilmesi için önce işletme profilinizi oluşturun.
                Kaydettiğinizde başvurunuz yönetici onayına gönderilir. Gelen sorular ve
                sadakat kartı, profil oluşturulduktan sonra açılır.
              </p>
            )}

            {tab === "inbox" && business && <InquiryInbox mode="owner" />}

            {tab === "loyalty" && business && <LoyaltyPanel />}

            {tab === "profile" && (
              <form className="profileForm" onSubmit={save}>
                {(() => {
                  const { score, missing } = profileStrength(form, logoList, photos);
                  return (
                    <div className="strengthBox">
                      <div
                        className="strengthRing"
                        style={{
                          background: `conic-gradient(#ff3c38 ${score * 3.6}deg, #f1e3e0 0deg)`,
                        }}
                        aria-label={`Profil gücü yüzde ${score}`}
                      >
                        <span>%{score}</span>
                      </div>
                      <div className="strengthBody">
                        <strong>Profil gücü</strong>
                        {missing.length > 0 ? (
                          <>
                            <p className="strengthLead">
                              Tamamladıkça müşterilere daha güvenilir görünürsünüz:
                            </p>
                            <ul>
                              {missing.map((m) => (
                                <li key={m.label}>
                                  <b>+%{m.points}</b> {m.label}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="strengthOk">
                            <FiCheck /> Harika! Profiliniz tamamen dolu; müşterilere en iyi şekilde
                            görünüyorsunuz.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <section className="fSection">
                  <header className="fHead">
                    <span className="num">1</span>
                    <div>
                      <h3>Temel bilgiler</h3>
                      <p>Müşterilerin sizi tanıyacağı ve arayacağı bilgiler</p>
                    </div>
                  </header>
                  <div className="formGrid">
                    <label className="full">
                      İşletme adı *
                      <input value={form.name} onChange={update("name")} maxLength={80} required />
                    </label>

                    <label>
                      Kategori *
                      <CategorySelect
                        value={form.categoryId}
                        onChange={update("categoryId")}
                        placeholder="Seçiniz"
                        required
                      />
                    </label>

                    <label>
                      Telefon *
                      <input
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="05xx xxx xx xx"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>
                </section>

                <section className="fSection">
                  <header className="fHead">
                    <span className="num">2</span>
                    <div>
                      <h3>Konum</h3>
                      <p>Listede ve haritada doğru yerde görünmeniz için</p>
                    </div>
                  </header>
                  <div className="formGrid">
                    <label>
                      İl *
                      <select value={form.city} onChange={update("city")} required>
                        <option value="">Seçiniz</option>
                        {cities.map((c) => (
                          <option key={c.il_adi} value={c.il_adi}>
                            {c.il_adi}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      İlçe *
                      <select
                        value={form.district}
                        onChange={update("district")}
                        disabled={!form.city}
                        required
                      >
                        <option value="">{form.city ? "Seçiniz" : "Önce il seçin"}</option>
                        {districts.map((d) => (
                          <option key={d.ilce_adi} value={d.ilce_adi}>
                            {d.ilce_adi}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="full">
                      Açık adres *
                      <input
                        value={form.address}
                        onChange={update("address")}
                        maxLength={200}
                        placeholder="Mahalle, cadde, no"
                        required
                      />
                    </label>
                  </div>
                </section>

                <section className="fSection">
                  <header className="fHead">
                    <span className="num">3</span>
                    <div>
                      <h3>Detaylar</h3>
                      <p>Çalışma saatleri, web siteniz ve işletmenizin tanıtımı</p>
                    </div>
                  </header>
                  <div className="formGrid">
                    <label className="full">
                      Çalışma saatleri
                      <textarea
                        value={form.workingHours}
                        onChange={update("workingHours")}
                        rows={4}
                        maxLength={400}
                        placeholder={"Her satıra bir gün veya aralık yazın:\nPazartesi - Cuma: 09:00 - 19:00\nCumartesi: 10:00 - 16:00\nPazar: Kapalı"}
                      />
                    </label>

                    <label className="full">
                      Web sitesi
                      <input
                        value={form.website}
                        onChange={update("website")}
                        placeholder="www.ornek.com"
                        inputMode="url"
                      />
                    </label>

                    <label className="full">
                      Açıklama
                      <textarea
                        value={form.description}
                        onChange={update("description")}
                        rows={7}
                        maxLength={3000}
                        placeholder="İşletmenizi, sunduğunuz hizmetleri ve avantajlarınızı anlatın."
                      />
                      <small className="counter">{form.description.length}/3000</small>
                    </label>
                  </div>
                </section>

                <section className="fSection">
                  <header className="fHead">
                    <span className="num">4</span>
                    <div>
                      <h3>Logo ve fotoğraflar</h3>
                      <p>Fotoğraflı profiller çok daha fazla ilgi görür</p>
                    </div>
                  </header>

                  <div className="uploadBlock">
                    <h4>
                      <FiImage /> Logo
                    </h4>
                    <div className="uploadRow">
                      <UploadWidget uwConfig={uploadConfig("business-logos", false)} setState={setLogoList} />
                      {logo && (
                        <div className="thumb logoThumb">
                          <img src={logo} alt="Logo" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="uploadBlock">
                    <h4>
                      <FiImage /> Fotoğraflar
                    </h4>
                    <p className="uploadHint">
                      İstediğiniz kadar fotoğraf ekleyebilirsiniz. Tek bir fotoğraf bile yeterli; ne
                      kadar çok olursa işletmeniz o kadar güvenilir görünür.
                    </p>
                    <UploadWidget uwConfig={uploadConfig("business-photos", true)} setState={setPhotos} />
                    {photos.length > 0 && (
                      <div className="thumbRow">
                        {photos.map((p, i) => (
                          <div className="thumb" key={p + i}>
                            <img src={p} alt={`Fotoğraf ${i + 1}`} />
                            <button
                              type="button"
                              aria-label="Fotoğrafı kaldır"
                              onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Mobilde ekranın altında yapışık kalır: kaydet düğmesi hep erişilebilir */}
                <div className="saveBar">
                  {message.text && <p className={`formMessage ${message.type}`}>{message.text}</p>}
                  <button type="submit" className="saveBtn" disabled={saving}>
                    {saving
                      ? "Kaydediliyor..."
                      : !business
                        ? "Başvuruyu Gönder"
                        : business.status === "rejected"
                          ? "Düzelt ve yeniden gönder"
                          : "Değişiklikleri Kaydet"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default BusinessDashboard;
