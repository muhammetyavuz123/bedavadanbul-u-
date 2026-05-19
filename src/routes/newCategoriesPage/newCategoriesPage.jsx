import { useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";
import "./newCategoriesPage.scss";

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
      // ALT KATEGORİ EKLE
      if (parentId) {
        await apiRequest.post("/categories", {
          name,
          parentId,
        });

        setSuccess("Alt kategori başarıyla eklendi ✅");
        setName("");
        return;
      }

      // YENİ ANA + ALT
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
    <div className="newCategoryPage">
      <div className="categoryCard">
        <div className="top">
          <h1>Kategori Sistemi</h1>
          <p>Yeni ana kategori veya alt kategori oluşturabilirsiniz.</p>
        </div>

        {/* VAR OLAN ANA */}
        <div className="formGroup">
          <label>Var Olan Ana Kategori</label>

          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">Ana kategori seç (varsa)</option>

            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="divider">
          <span>veya</span>
        </div>

        {/* YENİ ANA */}
        <div className="formGroup">
          <label>Yeni Ana Kategori</label>

          <input
            type="text"
            placeholder="Örn: Teknoloji"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
          />
        </div>

        {/* ALT */}
        <div className="formGroup">
          <label>Alt Kategori</label>

          <input
            type="text"
            placeholder="Örn: Telefon Tamiri"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* MESAJ */}
        {error && <div className="message error">{error}</div>}

        {success && <div className="message success">{success}</div>}

        <button onClick={submit} className="saveBtn">
          Kaydet
        </button>
      </div>
    </div>
  );
}

export default NewCategoryPage;
