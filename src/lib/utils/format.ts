export const escapeHtml = (s: unknown): string =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const HOUR_FMT = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
const DAY_FMT = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const TIME_FMT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

export const fmtHour = (iso: string): string => HOUR_FMT.format(new Date(iso));
export const fmtDay = (iso: string): string => DAY_FMT.format(new Date(iso));
export const fmtTime = (iso: string | null | undefined): string =>
  iso ? TIME_FMT.format(new Date(iso)) : '—';
export const fmtNow = (): string =>
  new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const isToday = (iso: string): boolean => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
         d.getMonth() === n.getMonth() &&
         d.getDate() === n.getDate();
};
