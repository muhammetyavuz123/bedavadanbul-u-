import { useEffect, useState } from "react";
import BrandPlaceholder from "../BrandPlaceholder/BrandPlaceholder";
import { isRealImage } from "../../lib/images";

// <img> yerine kullanılır: adres yoksa/geçersizse ya da görsel yüklenemezse
// kırık ikon yerine kodla çizilmiş BedavadanBul markasını gösterir.
function SafeImage({ src, alt = "", className, loading = "lazy", onError, ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!isRealImage(src) || failed) {
    return <BrandPlaceholder className={className} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}

export default SafeImage;
