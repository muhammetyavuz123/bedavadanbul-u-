// "905321234567" → "0532 123 45 67"
export const formatPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  let n = digits;
  if (digits.startsWith("90") && digits.length === 12) n = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) n = digits.slice(1);
  if (n.length !== 10) return String(phone);
  return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
};

// tel: bağlantısı için uluslararası biçim
export const telHref = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("90")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+9${digits}`;
  return `tel:+90${digits}`;
};

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
