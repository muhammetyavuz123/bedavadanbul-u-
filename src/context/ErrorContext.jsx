import { createContext, useContext, useState } from "react";
import Popup from "../components/Popup/Popup";

const ErrorContext = createContext({
  showError: () => {},
  hideError: () => {},
});

export const ErrorProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState(null);

  const showError = (message) => {
    setErrorMessage(message || "Lütfen daha sonra tekrar deneyin.");
  };

  const hideError = () => {
    setErrorMessage(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}

      {errorMessage && (
        <Popup
          isOpen={errorMessage}
          onClose={hideError}
          onConfirm={() => {
            hideError();
            window.location.href = "/contact";
          }}
          title="Bir hata oluştu"
          message={errorMessage}
          confirmText="Bildir"
          cancelText="Hayır"
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
