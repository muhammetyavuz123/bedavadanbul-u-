import "./starRating.scss";

// onChange verilirse tıklanabilir puan girişi, verilmezse sadece gösterim.
function StarRating({ value = 0, size = 16, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round(value);

  if (onChange) {
    return (
      <span className="starRating interactive" style={{ fontSize: size }}>
        {stars.map((s) => (
          <button
            type="button"
            key={s}
            className={s <= rounded ? "on" : ""}
            onClick={() => onChange(s)}
            aria-label={`${s} yıldız`}
          >
            ★
          </button>
        ))}
      </span>
    );
  }

  return (
    <span
      className="starRating"
      style={{ fontSize: size }}
      role="img"
      aria-label={`5 üzerinden ${value}`}
    >
      {stars.map((s) => (
        <span key={s} className={s <= rounded ? "on" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

export default StarRating;
