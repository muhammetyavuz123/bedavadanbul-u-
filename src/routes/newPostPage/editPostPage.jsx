import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import ReactQuill from "react-quill";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");

  const [form, setForm] = useState({
    title: "",
    price: "",
    address: "",
    city: "",
    district: "",
    type: "",
    businessName: "",
    latitude: "",
    longitude: "",
    phoneNumber: "",
    images: [],
    listingType: "standard",
    campaignDuration: "",
    discountAmount: "",
  });

  // ✅ POSTU GETİR
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiRequest.get(`/posts/${id}`);
        const post = res.data;

        setForm({
          title: post.title || "",
          price: post.price || "",
          address: post.address || "",
          city: post.city || "",
          district: post.district || "",
          type: post.type || "",
          businessName: post.businessName || "",
          latitude: post.latitude || "",
          longitude: post.longitude || "",
          phoneNumber: post.phoneNumber || "",
          images: post.images || [],
          listingType: post.listingType || "standard",
          campaignDuration: post.postDetail?.campaignDuration || "",
          discountAmount: post.postDetail?.discountAmount || "",
        });

        setValue(post.postDetail?.desc || "");
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPost();
  }, [id]);

  // ✅ INPUT HANDLE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiRequest.put(`/posts/${id}`, {
        postData: {
          ...form,
          price: parseInt(form.price),
        },
        postDetail: {
          desc: value,
          campaignDuration: form.campaignDuration,
          discountAmount: form.discountAmount,
        },
      });

      navigate("/" + id);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="newPostPage">
      <h1>Post Güncelle</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Başlık"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Fiyat"
          type="number"
        />

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Adres"
        />

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Şehir"
        />

        <input
          name="district"
          value={form.district}
          onChange={handleChange}
          placeholder="İlçe"
        />

        <input
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          placeholder="İşletme"
        />

        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="Telefon"
        />

        <select
          name="listingType"
          value={form.listingType}
          onChange={handleChange}
        >
          <option value="standard">Standard</option>
          <option value="featured">Vitrin</option>
        </select>

        <input
          name="campaignDuration"
          value={form.campaignDuration}
          onChange={handleChange}
          placeholder="Süre"
        />

        <input
          name="discountAmount"
          value={form.discountAmount}
          onChange={handleChange}
          placeholder="İndirim"
        />

        <ReactQuill value={value} onChange={setValue} />

        <button>Güncelle</button>
      </form>
    </div>
  );
}

export default EditPostPage;
