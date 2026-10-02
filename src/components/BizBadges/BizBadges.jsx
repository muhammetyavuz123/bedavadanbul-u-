import { FiAward } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import "./bizBadges.scss";

// Yönetici onaylı işletme rozeti
export function VerifiedBadge({ compact = false, className = "" }) {
  return (
    <span
      className={`bizBadge verified ${compact ? "compact" : ""} ${className}`}
      title="BedavadanBul ekibi tarafından doğrulanmış işletme"
    >
      <FaCheckCircle />
      {!compact && <span>Doğrulanmış</span>}
    </span>
  );
}

// Öne çıkan işletme rozeti
export function FeaturedBadge({ compact = false, className = "" }) {
  return (
    <span className={`bizBadge featured ${compact ? "compact" : ""} ${className}`}>
      <FiAward />
      <span>Öne Çıkan</span>
    </span>
  );
}
