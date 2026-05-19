import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import "./categoriesPage.scss";

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
        <div key={c.id} className={`categoryItem level-${level}`}>
          <div className="categoryCard">
            <div className="left">
              <div className="categoryInfo">
                <h4>{c.name}</h4>

                <span
                  className={`status ${c.isApproved ? "approved" : "pending"}`}
                >
                  {c.isApproved ? "Onaylandı" : "Onay Bekliyor"}
                </span>
              </div>
            </div>

            <div className="actions">
              {!c.isApproved && (
                <button className="approveBtn" onClick={() => approve(c.id)}>
                  Onayla
                </button>
              )}

              <button className="deleteBtn" onClick={() => remove(c.id)}>
                Sil
              </button>
            </div>
          </div>

          <div className="children">
            {renderCategories(items, c.id, level + 1)}
          </div>
        </div>
      ));
  };

  return (
    <div className="categoriesPage">
      <div className="top">
        <h1>Kategori Yönetimi</h1>

        <p>Tüm kategori ve alt kategorileri buradan yönetebilirsiniz.</p>
      </div>

      <div className="categoriesWrapper">{renderCategories(categories)}</div>
    </div>
  );
}

export default CategoriesPage;
