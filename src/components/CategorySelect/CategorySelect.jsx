import { useCategories } from "../../lib/useCategories";

// Sitedeki mevcut kategorileri (ana kategori + alt kategoriler) gruplu gösterir.
// Ana kategori de seçilebilir; filtrelemede alt kategorilerini de kapsar.
function CategorySelect({ value, onChange, placeholder = "Tümü", required = false }) {
  const categories = useCategories();
  const mains = categories.filter((c) => !c.parentId);

  return (
    <select value={value} onChange={onChange} required={required}>
      <option value="">{placeholder}</option>
      {mains.map((main) => {
        const subs = categories.filter((c) => c.parentId === main.id);
        if (subs.length === 0) {
          return (
            <option key={main.id} value={main.id}>
              {main.name}
            </option>
          );
        }
        return (
          <optgroup key={main.id} label={main.name}>
            <option value={main.id}>{main.name} (Genel)</option>
            {subs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

export default CategorySelect;
