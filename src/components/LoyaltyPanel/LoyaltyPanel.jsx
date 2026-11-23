import { useEffect, useState } from "react";
import { FiGift, FiPlus, FiTrash2, FiSmartphone } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import "./LoyaltyPanel.scss";

const EMPTY = {
  type: "stamp",
  isActive: true,
  goal: "5",
  rewardText: "",
  earnAmount: "100",
  earnPoints: "10",
  minIntervalMin: "10",
  rewards: [{ name: "", cost: "" }],
};

const KIND_LABEL = {
  earn: "Puan / adet eklendi",
  claim: "Puanla ödül alındı",
  redeem: "Kupon kullanıldı",
};

const fmtDate = (d) =>
  new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function eventText(e, type) {
  if (e.kind === "earn") {
    return type === "points"
      ? `${e.amount} TL alışveriş, +${e.delta} puan`
      : `${e.amount} adet, +${e.delta}`;
  }
  if (e.kind === "claim") return `${e.note || "Ödül"} (${e.delta} puan)`;
  return e.note || "Kupon";
}

export default function LoyaltyPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [hasProgram, setHasProgram] = useState(false);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fillFrom = (p) => {
    setForm({
      type: p.type,
      isActive: p.isActive,
      goal: String(p.goal ?? 5),
      rewardText: p.rewardText || "",
      earnAmount: String(p.earnAmount ?? 100),
      earnPoints: String(p.earnPoints ?? 10),
      minIntervalMin: String(p.minIntervalMin ?? 10),
      rewards: p.rewards?.length
        ? p.rewards.map((r) => ({ name: r.name, cost: String(r.cost) }))
        : [{ name: "", cost: "" }],
    });
  };

  const load = () =>
    Promise.all([
      apiRequest.get("/loyalty/me/program"),
      apiRequest.get("/loyalty/me/events", { params: { limit: 20 } }),
    ])
      .then(([p, ev]) => {
        if (p.data?.program) {
          setHasProgram(true);
          fillFrom(p.data.program);
        }
        setStats(p.data?.stats || null);
        setEvents(ev.data?.events || []);
      })
      .catch(() =>
        setMessage({ type: "error", text: "Sadakat bilgileri alınamadı. Sayfayı yenileyin." }),
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setReward = (i, key) => (e) =>
    setForm((f) => ({
      ...f,
      rewards: f.rewards.map((r, idx) => (idx === i ? { ...r, [key]: e.target.value } : r)),
    }));

  const addReward = () =>
    setForm((f) =>
      f.rewards.length >= 10 ? f : { ...f, rewards: [...f.rewards, { name: "", cost: "" }] },
    );

  const removeReward = (i) =>
    setForm((f) => ({
      ...f,
      rewards: f.rewards.length > 1 ? f.rewards.filter((_, idx) => idx !== i) : f.rewards,
    }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const body = {
        type: form.type,
        isActive: form.isActive,
        minIntervalMin: Number(form.minIntervalMin),
      };
      if (form.type === "stamp") {
        body.goal = Number(form.goal);
        body.rewardText = form.rewardText;
      } else {
        body.earnAmount = Number(form.earnAmount);
        body.earnPoints = Number(form.earnPoints);
        body.rewards = form.rewards.map((r) => ({ name: r.name, cost: Number(r.cost) }));
      }
      const res = await apiRequest.put("/loyalty/me/program", body);
      setHasProgram(true);
      fillFrom(res.data.program);
      setMessage({ type: "success", text: "Sadakat programınız kaydedildi." });
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Kaydedilemedi. Lütfen tekrar deneyin.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loyaltyLoading">Yükleniyor...</p>;

  const preview =
    form.type === "stamp"
      ? `${form.goal || "?"} alışverişte: ${form.rewardText || "hediye"}`
      : `${form.earnAmount || "?"} TL alışveriş = ${form.earnPoints || "?"} puan`;

  return (
    <div className="loyaltyPanel">
      <div className="loyaltyIntro">
        <FiGift />
        <div>
          <strong>Müşterilerinizi tekrar getirin</strong>
          <p>
            Müşteri uygulamadaki QR kodunu gösterir, siz de mobil uygulamadan okutursunuz. Adet
            (5 kahveye 1 hediye) ya da puan (100 TL = 10 puan) sistemini siz belirlersiniz.
          </p>
          <p className="how">
            <FiSmartphone /> Okutma: mobil uygulama, <b>Ayarlar &gt; Müşteri QR Okut</b>
          </p>
        </div>
      </div>

      {stats && (
        <div className="loyaltyStats">
          <div>
            <b>{stats.cards}</b>
            <span>Katılan müşteri</span>
          </div>
          <div>
            <b>{stats.scansToday}</b>
            <span>Bugün okutma</span>
          </div>
          <div>
            <b>{stats.activeCoupons}</b>
            <span>Açık kupon</span>
          </div>
          <div>
            <b>{stats.usedCoupons}</b>
            <span>Kullanılan kupon</span>
          </div>
        </div>
      )}

      <form className="loyaltyForm" onSubmit={save}>
        <div className="typePick">
          <button
            type="button"
            className={form.type === "stamp" ? "active" : ""}
            onClick={() => setForm((f) => ({ ...f, type: "stamp" }))}
          >
            <b>Adet kartı</b>
            <span>Örn. 5 kahveye 1 kahve hediye</span>
          </button>
          <button
            type="button"
            className={form.type === "points" ? "active" : ""}
            onClick={() => setForm((f) => ({ ...f, type: "points" }))}
          >
            <b>Puan</b>
            <span>Örn. 100 TL = 10 puan, puanla ödül seç</span>
          </button>
        </div>

        {form.type === "stamp" ? (
          <div className="formGrid">
            <label>
              Kaç alışverişte hediye?
              <input type="number" min="2" max="50" value={form.goal} onChange={set("goal")} required />
            </label>
            <label>
              Hediye nedir? (yazıyla yazın)
              <input
                type="text"
                minLength={2}
                maxLength={80}
                placeholder="Örn. 1 kahve hediye"
                value={form.rewardText}
                onChange={set("rewardText")}
                required
              />
            </label>
          </div>
        ) : (
          <>
            <div className="formGrid">
              <label>
                Alışveriş tutarı (TL)
                <input
                  type="number"
                  min="1"
                  value={form.earnAmount}
                  onChange={set("earnAmount")}
                  required
                />
              </label>
              <label>
                Kazanılan puan
                <input
                  type="number"
                  min="1"
                  value={form.earnPoints}
                  onChange={set("earnPoints")}
                  required
                />
              </label>
            </div>

            <div className="rewardList">
              <h4>Ödül listesi</h4>
              {form.rewards.map((r, i) => (
                <div className="rewardRow" key={i}>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Ödül (örn. 1 kahve)"
                    value={r.name}
                    onChange={setReward(i, "name")}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Puan"
                    value={r.cost}
                    onChange={setReward(i, "cost")}
                    required
                  />
                  <button
                    type="button"
                    aria-label="Ödülü sil"
                    onClick={() => removeReward(i)}
                    disabled={form.rewards.length <= 1}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              {form.rewards.length < 10 && (
                <button type="button" className="addReward" onClick={addReward}>
                  <FiPlus /> Ödül ekle
                </button>
              )}
            </div>
          </>
        )}

        <div className="formGrid">
          <label>
            Aynı müşteriye tekrar işlem için bekleme (dakika)
            <input
              type="number"
              min="1"
              max="720"
              value={form.minIntervalMin}
              onChange={set("minIntervalMin")}
              required
            />
            <small>Aynı QR'ın art arda okutulmasını engeller.</small>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Program açık
          </label>
        </div>

        <p className="preview">
          Müşteri kartında görünecek: <b>{preview}</b>
        </p>

        {hasProgram && (
          <p className="note">
            Müşteri kartları oluştuktan sonra program türünü (adet ya da puan) değiştiremezsiniz; diğer
            ayarları istediğiniz zaman düzenleyebilirsiniz.
          </p>
        )}

        {message.text && <p className={`formMessage ${message.type}`}>{message.text}</p>}

        <button type="submit" className="saveBtn" disabled={saving}>
          {saving ? "Kaydediliyor..." : hasProgram ? "Değişiklikleri Kaydet" : "Programı Başlat"}
        </button>
      </form>

      {events.length > 0 && (
        <div className="loyaltyEvents">
          <h4>Son işlemler</h4>
          <ul>
            {events.map((e) => (
              <li key={e.id}>
                <span className="when">{fmtDate(e.createdAt)}</span>
                <span className="who">{e.customer}</span>
                <span className="what">
                  <i>{KIND_LABEL[e.kind] || e.kind}</i> · {eventText(e, form.type)}
                </span>
              </li>
            ))}
          </ul>
          <p className="note">Müşteri adları gizlilik için kısaltılarak gösterilir.</p>
        </div>
      )}
    </div>
  );
}
