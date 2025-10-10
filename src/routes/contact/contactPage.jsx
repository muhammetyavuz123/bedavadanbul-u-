import React, { useState } from "react";
import "./contactPage.scss";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import apiRequest from "../../lib/apiRequest";
import BreadcrumbImage from "../../assets/breadcrumb.png";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      const res = await apiRequest.post("/contact", formData);
      setStatus(res.data.message);
      setFormData({ name: "", email: "", message: "", phone: "" });
    } catch (error) {
      console.error(error);
      setStatus(
        error.response?.data?.message || "Gönderme sırasında hata oluştu."
      );
    }
  };

  return (
    <>
      <Breadcrumb
        title="İletişim"
        breadcrumbText="Anasayfa / İletişim"
        backgroundImage={BreadcrumbImage}
      />{" "}
      <section className="contact-page">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2>İletişim Bilgileri</h2>
            <p className="contact-desc">
              Aşağıdaki bilgilerden bize ulaşabilir ya da formu doldurarak mesaj
              bırakabilirsiniz.
            </p>

            <div className="info-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>İstanbul, Türkiye</span>
            </div>

            <div className="info-item">
              <i className="fa-solid fa-envelope"></i>
              <a href="mailto:info@site.com">bedavadanbul@gmail.com</a>
            </div>

            {/* <div className="info-item">
              <i className="fa-solid fa-phone"></i>
              <a href="tel:+905551112233">+90 555 111 22 33</a>
            </div> */}
          </div>

          <div className="contact-form-container">
            <h2>Mesaj Gönder</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Adınız"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="phone"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Mesajınız"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <span>{status}</span>
              <button type="submit">Gönder</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
