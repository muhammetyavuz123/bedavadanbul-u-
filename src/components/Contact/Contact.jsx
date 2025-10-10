import React, { useEffect, useState } from "react";
import axios from "axios";
import "./messagesPage.scss"; // opsiyonel: stiller için
import apiRequest from "../../lib/apiRequest";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get("/contact");
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        setError("Mesajlar alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="messages-page">
      <h2>Gelen Mesajlar</h2>
      {messages.length === 0 ? (
        <p>Henüz mesaj yok.</p>
      ) : (
        <div className="message-list">
          {messages.map((msg) => (
            <div key={msg.id} className="message-card">
              <h4>
                {msg.name} <span>({msg.email})</span>
              </h4>
              <p>{msg.phone}</p>
              <p>{msg.message}</p>
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
