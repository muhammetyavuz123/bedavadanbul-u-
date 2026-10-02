import { bizTheme } from "../../lib/bizTheme";
import "./bizAvatar.scss";

// Logo varsa onu, yoksa işletme adının baş harfleriyle renkli bir avatar gösterir.
// Kapsayıcısını %100 doldurur; boyutu kapsayıcı belirler.
function BizAvatar({ name, logo, alt }) {
  if (logo) {
    return <img src={logo} alt={alt ?? name ?? ""} loading="lazy" />;
  }
  const theme = bizTheme(name);
  return (
    <span className="bizAvatar" style={{ background: theme.gradient }} aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central">
          {theme.initials}
        </text>
      </svg>
    </span>
  );
}

export default BizAvatar;
