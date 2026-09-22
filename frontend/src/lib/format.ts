const money = new Intl.NumberFormat("en-RW", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const quantity = new Intl.NumberFormat("en-RW", {
  maximumFractionDigits: 2,
});

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMoney(value: number) {
  return `RWF ${money.format(value)}`;
}

export function formatQuantity(value: number, unit?: string) {
  const formatted = quantity.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDate(value: string) {
  return dateTime.format(new Date(value));
}

export function stockLabel(status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK") {
  if (status === "OUT_OF_STOCK") return "Out";
  if (status === "LOW_STOCK") return "Low";
  return "High";
}
