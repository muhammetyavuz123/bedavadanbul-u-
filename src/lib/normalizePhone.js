// src/utils/normalizePhone.js
export const normalizePhone = (input) => {
  const digits = input.replace(/\D/g, ""); // Sadece rakamları al

  if (digits.startsWith("0") && digits.length === 11) {
    return "90" + digits.slice(1);
  }

  if (digits.length === 10) {
    return "90" + digits;
  }

  if (digits.startsWith("90") && digits.length === 12) {
    return digits;
  }

  return digits; // fallback
};
