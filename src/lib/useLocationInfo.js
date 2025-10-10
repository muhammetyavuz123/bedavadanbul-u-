// useLocationInfo.js
import { useEffect, useState } from "react";

const useLocationInfo = () => {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("Tarayıcı konum bilgisini desteklemiyor.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`
            );

            const data = await response.json();
            const address = data.address;

            setCity(address.province);
            setDistrict(address.town);
            // İl ve İlçe bilgisi
            const foundCity = address.state || "Bilinmiyor";
            const foundDistrict =
              address.county ||
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              "Bilinmiyor";

            // setCity(foundCity);
            // setDistrict(foundDistrict);
            setLoading(false);
          } catch (err) {
            setError("Konum alınırken hata oluştu.");
            setLoading(false);
          }
        },
        (err) => {
          setError("Konum izni reddedildi: " + err.message);
          setLoading(false);
        }
      );
    };

    getLocation();
  }, []);

  return { city, district, loading, error };
};

export default useLocationInfo;
