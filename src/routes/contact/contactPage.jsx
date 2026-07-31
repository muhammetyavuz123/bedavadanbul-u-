import React, { useState } from "react";
import "./contactPage.scss";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import apiRequest from "../../lib/apiRequest";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import { FiMapPin, FiMail, FiSend, FiCheckCircle, FiXCircle } from "react-icons/fi";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsLoading(true);

    try {
      const res = await apiRequest.post("/contact", formData);
      setStatus(res.data.message || "Mesajınız başarıyla gönderildi.");
      setSuccess(true);
      setFormData({ name: "", email: "", message: "", phone: "" });
    } catch (error) {
      setSuccess(false);
      setStatus(
        error.response?.data?.message || "Gönderme sırasında hata oluştu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title="İletişim"
        breadcrumbText="Anasayfa / İletişim"
        backgroundImage={BreadcrumbImage}
      />
      <section className="contact-page">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2>İletişim Bilgileri</h2>
            <p className="contact-desc">
              Aşağıdaki bilgilerden bize ulaşabilir ya da formu doldurarak
              mesaj bırakabilirsiniz.
            </p>

            <div className="info-item">
              <span className="iconBox">
                <FiMapPin />
              </span>
              <span>İstanbul, Türkiye</span>
            </div>

            <div className="info-item">
              <span className="iconBox">
                <FiMail />
              </span>
              <a href="mailto:bedavadanbul@gmail.com">
                bedavadanbul@gmail.com
              </a>
            </div>
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
                type="tel"
                name="phone"
                placeholder="Telefon"
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
              {status && (
                <span className={`formStatus ${success ? "success" : "error"}`}>
                  {success ? <FiCheckCircle /> : <FiXCircle />} {status}
                </span>
              )}
              <button type="submit" disabled={isLoading}>
                <FiSend />
                {isLoading ? "Gönderiliyor..." : "Gönder"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
