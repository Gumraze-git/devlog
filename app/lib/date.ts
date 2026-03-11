const koDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDateKo(date: string): string {
  return koDateFormatter.format(new Date(date));
}
