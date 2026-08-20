export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const PAYPAL_CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "USD - US Dollar ($)", symbol: "$" },
  { code: "EUR", label: "EUR - Euro (€)", symbol: "€" },
  { code: "AUD", label: "AUD - Australian Dollar (A$)", symbol: "A$" },
  { code: "CAD", label: "CAD - Canadian Dollar (C$)", symbol: "C$" },
  { code: "GBP", label: "GBP - British Pound (£)", symbol: "£" },
  { code: "JPY", label: "JPY - Japanese Yen (¥)", symbol: "¥" },
  { code: "SGD", label: "SGD - Singapore Dollar (S$)", symbol: "S$" },
  { code: "HKD", label: "HKD - Hong Kong Dollar (HK$)", symbol: "HK$" },
  { code: "NZD", label: "NZD - New Zealand Dollar (NZ$)", symbol: "NZ$" },
  { code: "CHF", label: "CHF - Swiss Franc (CHF)", symbol: "CHF" },
  { code: "SEK", label: "SEK - Swedish Krona (kr)", symbol: "kr" },
  { code: "DKK", label: "DKK - Danish Krone (kr.)", symbol: "kr." },
  { code: "NOK", label: "NOK - Norwegian Krone (kr)", symbol: "kr" },
  { code: "PLN", label: "PLN - Polish Zloty (zł)", symbol: "zł" },
  { code: "CZK", label: "CZK - Czech Koruna (Kč)", symbol: "Kč" },
  { code: "HUF", label: "HUF - Hungarian Forint (Ft)", symbol: "Ft" },
  { code: "ILS", label: "ILS - Israeli New Shekel (₪)", symbol: "₪" },
  { code: "MXN", label: "MXN - Mexican Peso ($)", symbol: "$" },
  { code: "BRL", label: "BRL - Brazilian Real (R$)", symbol: "R$" },
  { code: "MYR", label: "MYR - Malaysian Ringgit (RM)", symbol: "RM" },
  { code: "PHP", label: "PHP - Philippine Peso (₱)", symbol: "₱" },
  { code: "TWD", label: "TWD - New Taiwan Dollar (NT$)", symbol: "NT$" },
  { code: "THB", label: "THB - Thai Baht (฿)", symbol: "฿" },
  { code: "CNY", label: "CNY - Chinese Renminbi (¥)", symbol: "¥" },
];
