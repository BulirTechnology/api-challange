export function formatDate(date: Date, locale: "pt" | "en"): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();
  const dateString = date.toDateString();

  if (dateString === todayString) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const now = new Date();
    const nowHours = String(now.getHours()).padStart(2, "0");
    const nowMinutes = String(now.getMinutes()).padStart(2, "0");

    if (hours === nowHours && minutes === nowMinutes) {
      return locale === "pt" ? "agora" : "now";
    } else {
      return `${hours}:${minutes}`;
    }
  } else if (dateString === yesterdayString) {
    return locale === "pt" ? "ontem" : "Yesterday";
  } else {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
