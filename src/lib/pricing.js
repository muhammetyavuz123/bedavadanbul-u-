// Basit, tek yerden yönetilen ÖRNEK fiyat tablosu (₺).
// Not: Şu an gerçek bir ödeme altyapısı (iyzico/Stripe vb.) bağlı değil;
// "para alınmayacak" kararı gereği ödeme adımı sadece akışı gösterir,
// hiçbir gerçek tahsilat yapılmaz. İleride gerçek fiyatlarınızı
// belirlediğinizde sadece bu dosyadaki sayıları değiştirmeniz yeterli.
//
// Kural: Standart ilanlar her zaman ücretsizdir (ilk ilan dahil, hep).
// Vitrin ve Doping ilanlar ise her zaman ücretlidir — kullanıcının
// ilk ilanı bile olsa ücretsiz geçiş hakkı yoktur.
export const PRICING = {
  standard: { 1: 0, 3: 0, 6: 0, 12: 0 },
  featured: { 1: 149, 3: 399, 6: 699, 12: 1199 },
  doping: { 1: 249, 3: 649, 6: 1099, 12: 1899 },
};

export const LISTING_TYPE_LABELS = {
  standard: "Standart İlan",
  featured: "Vitrin İlan",
  doping: "Doping İlan",
};

export const PAID_LISTING_TYPES = ["featured", "doping"];

export function isPaidListingType(listingType) {
  return PAID_LISTING_TYPES.includes(listingType);
}

export function getListingPrice(listingType, adDuration) {
  const table = PRICING[listingType];
  if (!table) return 0;
  return table[adDuration] ?? 0;
}
