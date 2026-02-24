// ─── Date Helpers ───
export const pad = (n) => String(n).padStart(2, "0");

export const dateKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

export const todayKey = () => dateKey(new Date());

export const isToday = (dk) => dk === todayKey();

export const isFuture = (dk) => dk > todayKey();

export const isPast = (dk) => dk < todayKey();

export const addDays = (dk, n) => {
  const d = new Date(dk + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const fmtTime = (h, m) => `${pad(h)}:${pad(m)}`;

export const fmtBRL = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const monthKey = (d) => {
  const dt = typeof d === "string" ? new Date(d + "T12:00:00") : d;
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
};

export const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Format date for display ───
export const fmtDate = (dk) =>
  new Date(dk + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const fmtDateShort = (dk) =>
  new Date(dk + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

// ─── Time string to DB format ───
export const timeToDb = (timeStr) => timeStr + ":00"; // "09:30" → "09:30:00"
export const timeFromDb = (timeStr) => timeStr?.slice(0, 5) || "09:00"; // "09:30:00" → "09:30"
