/** Calendar arithmetic uses local Y/M/D; UTC is only an ordinal conversion, avoiding DST. */
export function localDay(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
export function dayIndex(day: number, length: number) { return ((day % length) + length) % length; }
/** Update labels/recommendations, never replace the exercise being practiced. */
export function watchCalendar(update: () => void) {
  let day = localDay();
  const check = () => { const next = localDay(); if (next !== day) { day = next; update(); } };
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', check);
  window.setInterval(check, 15000);
}
