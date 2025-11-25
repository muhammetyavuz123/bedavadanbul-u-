import { createContext, useEffect, useState, useRef } from "react";

// Create a context (isteğe bağlı)
const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, setState }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef(null);

  // Scripti yükle
  useEffect(() => {
    const existingScript = document.getElementById("cloudinary-widget");

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.id = "cloudinary-widget";
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Script yüklendikten sonra widget oluştur
  useEffect(() => {
    if (scriptLoaded && window.cloudinary && !widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Upload success:", result.info);
            setState((prev) => [...prev, result.info.secure_url]);
          }
        }
      );
    }
  }, [scriptLoaded, uwConfig, setState]);

  const handleUpload = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.warn("Widget not ready yet.");
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ scriptLoaded }}>
      <button
        type="button"
        className="cloudinary-button"
        onClick={handleUpload}
        disabled={!scriptLoaded}
      >
        Resim Yükle
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default UploadWidget;
export { CloudinaryScriptContext };
