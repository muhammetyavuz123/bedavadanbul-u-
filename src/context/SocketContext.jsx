import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Giriş yapmamış ziyaretçi için socket bağlantısına hiç gerek yok —
    // chat özelliği zaten sadece giriş yapmış kullanıcılar için. Önceden
    // burası herkes (anonim ziyaretçiler dahil) için koşulsuz bağlanıyordu;
    // bu da her sayfa yüklemesinde gereksiz (ve socket sunucusu adresi
    // ayarlı değilse başarısız) bir bağlantı denemesine yol açıyordu.
    if (!currentUser) {
      setSocket(null);
      return;
    }

    // Production'da gerçek socket sunucusu adresi VITE_SOCKET_URL ile
    // verilmeli (bkz. client/.env). Değer yoksa yerel geliştirmeye düşer.
    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4000",
    );
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [currentUser]);

  useEffect(() => {
    currentUser && socket?.emit("newUser", currentUser?.id);
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
