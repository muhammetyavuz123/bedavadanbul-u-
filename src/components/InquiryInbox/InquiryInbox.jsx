import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiInbox, FiArrowLeft, FiRefreshCw, FiSend } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { formatDateTime } from "../../lib/formatPhone";
import "./inquiryInbox.scss";

const STATUS_LABEL = {
  owner: { open: "Yanıt bekliyor", answered: "Yanıtlandı", closed: "Kapatıldı" },
  customer: { open: "Yanıt bekleniyor", answered: "Yanıtlandı", closed: "Kapatıldı" },
};

// mode="owner"    → işletmeye gelen sorular
// mode="customer" → benim işletmelere sorduğum sorular
function InquiryInbox({ mode = "customer" }) {
  const { currentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("t");

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState("");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef(null);

  const listUrl =
    mode === "owner" ? "/businesses/me/inquiries" : "/businesses/inquiries/mine";
  const unreadKey = mode === "owner" ? "ownerUnread" : "customerUnread";

  const loadList = useCallback(async () => {
    try {
      const res = await apiRequest.get(listUrl);
      setItems(res.data.data || []);
      setListError("");
    } catch (err) {
      setListError(err.response?.data?.message || "Sorular alınamadı.");
    } finally {
      setLoadingList(false);
    }
  }, [listUrl]);

  const loadThread = useCallback(async (id) => {
    setLoadingThread(true);
    setThreadError("");
    try {
      const res = await apiRequest.get(`/businesses/inquiries/${id}`);
      setThread(res.data);
    } catch (err) {
      setThread(null);
      setThreadError(err.response?.data?.message || "Konuşma alınamadı.");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    setReply("");
    setSendError("");
    if (selectedId) {
      loadThread(selectedId).then(loadList); // okundu işaretlenince listeyi tazele
    } else {
      setThread(null);
    }
  }, [selectedId, loadThread, loadList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread?.messages?.length]);

  const select = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("t", id);
    else next.delete("t");
    setSearchParams(next, { replace: true });
  };

  const sendReply = async (e) => {
    e.preventDefault();
    const message = reply.trim();
    if (!message || !thread) return;
    setSending(true);
    setSendError("");
    try {
      const res = await apiRequest.post(
        `/businesses/inquiries/${thread.id}/messages`,
        { message },
      );
      setThread((prev) => ({
        ...prev,
        status: thread.viewerRole === "owner" ? "answered" : "open",
        messages: [...prev.messages, res.data],
      }));
      setReply("");
      loadList();
    } catch (err) {
      setSendError(err.response?.data?.message || "Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const closeThread = async () => {
    if (!thread) return;
    if (!window.confirm("Bu konuşmayı kapatmak istiyor musunuz?")) return;
    try {
      await apiRequest.patch(`/businesses/inquiries/${thread.id}/close`);
      setThread((prev) => ({ ...prev, status: "closed" }));
      loadList();
    } catch (err) {
      setSendError(err.response?.data?.message || "Konuşma kapatılamadı.");
    }
  };

  const labels = STATUS_LABEL[mode];

  return (
    <div className={`inquiryInbox ${selectedId ? "hasSelection" : ""}`}>
      <aside className="inboxList">
        <div className="inboxListHead">
          <h3>{mode === "owner" ? "Gelen Sorular" : "Sorduğum Sorular"}</h3>
          <button type="button" onClick={loadList} aria-label="Yenile">
            <FiRefreshCw />
          </button>
        </div>

        {loadingList && <p className="muted">Yükleniyor...</p>}
        {listError && <p className="errorText">{listError}</p>}

        {!loadingList && !listError && items.length === 0 && (
          <div className="inboxEmpty">
            <FiInbox />
            <p>
              {mode === "owner"
                ? "Henüz size soru gelmedi."
                : "Henüz bir işletmeye soru sormadınız."}
            </p>
            {mode === "customer" && (
              <Link to="/isletmeler" className="inboxLink">
                İşletmelere göz at
              </Link>
            )}
          </div>
        )}

        {items.map((item) => {
          const last = item.messages?.[0];
          const who =
            mode === "owner" ? item.customer?.username : item.business?.name;
          return (
            <button
              type="button"
              key={item.id}
              className={`inboxItem ${item.id === selectedId ? "active" : ""}`}
              onClick={() => select(item.id)}
            >
              <div className="inboxItemTop">
                <strong>{who}</strong>
                {item[unreadKey] && <span className="unreadDot" aria-label="Yeni" />}
              </div>
              <div className="inboxSubject">{item.subject}</div>
              {last && <div className="inboxPreview">{last.text}</div>}
              <div className="inboxMeta">
                <span className={`statusPill ${item.status}`}>
                  {labels[item.status]}
                </span>
                <span>{formatDateTime(item.updatedAt)}</span>
              </div>
            </button>
          );
        })}
      </aside>

      <section className="inboxThread">
        {!selectedId && (
          <div className="threadPlaceholder">
            <FiInbox />
            <p>Görüntülemek için soldan bir konuşma seçin.</p>
          </div>
        )}

        {selectedId && loadingThread && !thread && <p className="muted">Yükleniyor...</p>}
        {selectedId && threadError && <p className="errorText">{threadError}</p>}

        {selectedId && thread && (
          <>
            <div className="threadHead">
              <button
                type="button"
                className="backBtn"
                onClick={() => select(null)}
                aria-label="Listeye dön"
              >
                <FiArrowLeft />
              </button>
              <div className="threadTitle">
                <h3>{thread.subject}</h3>
                <p>
                  {thread.viewerRole === "owner" ? (
                    <>Müşteri: {thread.customer?.username}</>
                  ) : (
                    <>
                      İşletme:{" "}
                      <Link to={`/isletme/${thread.business?.id}`}>
                        {thread.business?.name}
                      </Link>
                    </>
                  )}
                </p>
              </div>
              {thread.status !== "closed" && (
                <button type="button" className="closeBtn" onClick={closeThread}>
                  Konuşmayı kapat
                </button>
              )}
            </div>

            <div className="messages">
              {thread.messages.map((m) => {
                const mine = m.senderId === currentUser?.id;
                return (
                  <div key={m.id} className={`bubbleRow ${mine ? "mine" : "theirs"}`}>
                    <div className="bubble">
                      <p>{m.text}</p>
                      <span>{formatDateTime(m.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {thread.status === "closed" ? (
              <p className="closedNote">Bu konuşma kapatıldı.</p>
            ) : (
              <form className="replyForm" onSubmit={sendReply}>
                {sendError && <p className="errorText">{sendError}</p>}
                <div className="replyRow">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={2}
                    maxLength={1000}
                  />
                  <button type="submit" disabled={sending || !reply.trim()}>
                    <FiSend /> Gönder
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default InquiryInbox;
