import { useContext, useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import List from "../../components/list/List";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

// onAdd: panelde "Kampanya Ekle" sekmesine geçmek için (Tab bileşeni verir)
function ProfilList({ onAdd }) {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === "admin";
  const [confirmData, setConfirmData] = useState(null); // null: yükleniyor
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const confirmPostGet = async () => {
      try {
        const res = await apiRequest.get(
          isAdmin
            ? `/posts?page=1&limit=100`
            : `/posts?userId=${currentUser?.id}`,
        );

        if (!cancelled) setConfirmData(res.data);
      } catch (err) {
        console.log(err);
        if (!cancelled) {
          setError("Kampanyalar yüklenemedi. Lütfen sayfayı yenileyin.");
          setConfirmData({ data: [] });
        }
      }
    };

    confirmPostGet();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = confirmData?.data?.length;

  return (
    <div className="myCampaigns">
      <div className="mcHead">
        <p>
          {confirmData === null
            ? "Yükleniyor..."
            : `${count || 0} kampanya`}
        </p>
        {!isAdmin && onAdd && (
          <button type="button" className="mcAdd" onClick={onAdd}>
            <FiPlusCircle /> Kampanya ekle
          </button>
        )}
      </div>

      {error && <p className="mcError">{error}</p>}

      {confirmData !== null && <List posts={confirmData} />}
    </div>
  );
}

export default ProfilList;
