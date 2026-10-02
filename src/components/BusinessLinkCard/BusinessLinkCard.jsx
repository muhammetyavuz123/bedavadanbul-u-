import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import BizAvatar from "../BizAvatar/BizAvatar";
import { VerifiedBadge } from "../BizBadges/BizBadges";
import "./businessLinkCard.scss";

// Kampanya sayfasında: kampanyayı yayınlayan işletmenin profiline giden kart
function BusinessLinkCard({ business }) {
  if (!business || business.isActive === false) return null;
  return (
    <Link to={`/isletme/${business.id}`} className="bizLinkCard">
      <span className="bizLinkLogo">
        <BizAvatar name={business.name} logo={business.logo} />
      </span>
      <span className="bizLinkText">
        <small>Kampanyayı yayınlayan işletme</small>
        <strong>
          {business.name} {business.isVerified && <VerifiedBadge compact />}
        </strong>
      </span>
      <span className="bizLinkGo">
        Profil <FiArrowRight />
      </span>
    </Link>
  );
}

export default BusinessLinkCard;
