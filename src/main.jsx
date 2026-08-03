import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.scss";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { ErrorProvider } from "./context/ErrorContext.jsx";
// import { SocketContextProvider } from "./context/SocketContext.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <ErrorProvider>
      <AuthContextProvider>
        {/* <SocketContextProvider> */}
        <App />
        {/* </SocketContextProvider> */}
      </AuthContextProvider>
    </ErrorProvider>
  </HelmetProvider>,
);
