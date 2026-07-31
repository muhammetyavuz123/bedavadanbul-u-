import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import "./floatingContact.scss";

function FloatingContact() {
  return (
    <Link to="/contact" className="floatingContact" aria-label="Bize Ulaşın">
      <FiMessageCircle />
      <span className="floatingContactLabel">Bize Ulaşın</span>
    </Link>
  );
}

export default FloatingContact;
