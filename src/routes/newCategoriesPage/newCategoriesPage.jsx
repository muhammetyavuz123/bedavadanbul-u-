import { useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";

function NewCategoryPage() {
  const [categories, setCategories] = useState([]);

  const [parentId, setParentId] = useState("");
  const [newParentName, setNewParentName] = useState("");

  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiRequest.get("/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const mainCategories = categories.filter((c) => !c.parentId);

  const submit = async () => {
    setError("");
    setSuccess("");

    try {
      // 🔵 VAR OLAN ANA KATEGORİYE ALT EKLE
      if (parentId) {
        await apiRequest.post("/categories", {
          name,
          parentId,
        });

        setSuccess("Alt kategori başarıyla eklendi ✅");
        setName("");
        return;
      }

      // 🟢 YENİ ANA + ALT EKLE
      if (newParentName) {
        const res = await apiRequest.post("/categories", {
          name: newParentName,
          parentId: null,
        });

        const newParentId = res.data.id;

        await apiRequest.post("/categories", {
          name,
          parentId: newParentId,
        });

        setSuccess("Ana ve alt kategori oluşturuldu ✅");
        setName("");
        setNewParentName("");
        return;
      }

      setError("Bir seçim yapmalısın ❗");
    } catch (err) {
      setError(err.response?.data?.message || "Bir hata oluştu ❌");
    }
  };

  return (
    <div>
      <h1>Kategori Sistemi</h1>

      {/* ANA KATEGORİ SEÇ */}
      <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
        <option value="">Ana kategori seç (varsa)</option>

        {mainCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <hr />

      {/* YENİ ANA */}
      <input
        placeholder="Yeni ana kategori (yoksa)"
        value={newParentName}
        onChange={(e) => setNewParentName(e.target.value)}
      />

      <hr />

      {/* ALT KATEGORİ */}
      <input
        placeholder="Alt kategori adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <hr />

      {/* MESAJLAR */}
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      {success && (
        <div style={{ color: "green", marginBottom: 10 }}>{success}</div>
      )}

      <button onClick={submit}>Kaydet</button>
    </div>
  );
}

export default NewCategoryPage;
