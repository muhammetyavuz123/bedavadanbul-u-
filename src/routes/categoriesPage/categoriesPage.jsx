import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await apiRequest.get("/categories?all=true");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const approve = async (id) => {
    await apiRequest.patch(`/categories/approve/${id}`);
    fetchCategories();
  };

  const remove = async (id) => {
    const ok = confirm("Silmek istediğine emin misin?");
    if (!ok) return;

    try {
      await apiRequest.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Silme hatası");
    }
  };

  const renderCategories = (items, parentId = null, level = 0) => {
    return items
      .filter((c) => (c.parentId || null) === parentId)
      .map((c) => (
        <div
          key={c.id}
          style={{
            marginLeft: level * 20,
            padding: "8px",
            borderLeft: "2px solid #ddd",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <span>
              {c.name} {!c.isApproved && "(Bekliyor)"}
            </span>

            {!c.isApproved && (
              <button onClick={() => approve(c.id)}>Onayla</button>
            )}

            <button onClick={() => remove(c.id)} style={{ color: "red" }}>
              Sil
            </button>
          </div>

          {renderCategories(items, c.id, level + 1)}
        </div>
      ));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Kategori Yönetimi</h2>
      {renderCategories(categories)}
    </div>
  );
}

export default CategoriesPage;
