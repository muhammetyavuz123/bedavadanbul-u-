import { memo, useState } from "react";
import "./brandPlaceholder.scss";

// Fotoğraf olmayan her yerde gösterilen BedavadanBul markası.
// PNG/JPG DEĞİL: saf SVG (kodla çizilmiş) — ek ağ isteği yok, her boyutta keskin.
// Kapsayıcısını %100 doldurur; boyutu kapsayıcı belirler.
let seq = 0;

function BrandPlaceholder({ className = "", title = "" }) {
  const [id] = useState(() => `bp${++seq}`);
  return (
    <svg
      className={`brandPh ${className}`.trim()}
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={title || "BedavadanBul"}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4f1" />
          <stop offset="1" stopColor="#ffe2da" />
        </linearGradient>
        <linearGradient id={`${id}-pin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5a3f" />
          <stop offset="1" stopColor="#ff2d3a" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${id}-bg)`} />
      <circle cx="200" cy="125" r="100" fill="#fff" opacity=".55" />
      <g transform="translate(200 128) scale(.2) translate(-590 -490)">
        <path
          d="M512 150 C380 150 285 250 285 385 C285 560 430 690 512 830 C594 690 739 560 739 385 C739 250 644 150 512 150Z"
          fill={`url(#${id}-pin)`}
        />
        <circle cx="512" cy="385" r="105" fill="#fff" />
        <g transform="translate(722 236) rotate(40) scale(1.7)">
          <path
            d="M-74 0 L-32 -44 H78 a16 16 0 0 1 16 16 V28 a16 16 0 0 1 -16 16 H-32 Z"
            fill="#fff"
            stroke="#ff4a3b"
            strokeWidth="7"
          />
          <circle cx="-30" cy="0" r="9" fill="#ff4a3b" />
        </g>
      </g>
    </svg>
  );
}

export default memo(BrandPlaceholder);
