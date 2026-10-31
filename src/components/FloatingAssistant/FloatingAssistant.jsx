import { Link, useLocation } from "react-router-dom";
import { FiZap } from "react-icons/fi";
import "./floatingAssistant.scss";

// Sağ alttaki "Asistana sor" butonu. Asistan sayfasının kendisinde gizlenir.
function FloatingAssistant() {
  const { pathname } = useLocation();
  if (pathname === "/asistan") return null;

  return (
    <Link to="/asistan" className="floatingAssistant" aria-label="Asistana sor">
      <FiZap />
      <span className="floatingAssistantLabel">Asistana sor</span>
    </Link>
  );
}

export default FloatingAssistant;
