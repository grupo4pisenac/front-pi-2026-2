const LOCALE = 'pt-BR';

/** Espaço fino inseparável (U+202F) entre número e unidade. */
export const THIN = ' ';

const integerFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decimalFmt = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const signedPctFmt = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto', style: 'narrow' });

export const formatInteger = (n: number): string => integerFmt.format(n);
export const formatDecimal = (n: number): string => decimalFmt.format(n);

/** 46 → "46%" (pt-BR cola o símbolo de % sem espaço, como nas telas) */
export const formatPercent = (n: number, fractionDigits = 0): string =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits }).format(n)}%`;

/** 8.2 → "+8,2%" */
export const formatSignedPercent = (n: number): string => signedPctFmt.format(n / 100);

export const formatTons = (n: number): string => `${formatInteger(n)}${THIN}t`;
export const formatCelsius = (n: number, digits = 0): string =>
  `${digits ? formatDecimal(n) : formatInteger(n)}${THIN}°C`;
export const formatMm = (n: number, digits = 0): string =>
  `${digits ? formatDecimal(n) : formatInteger(n)}${THIN}mm`;

export const formatTime = (iso: string): string => timeFmt.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFmt.format(new Date(iso));
export const formatDate = (iso: string): string => dateFmt.format(new Date(iso));

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "Agora", "Há 2 min", "Há 3 h", "Ontem"… */
export function formatRelative(iso: string | null, now: number = Date.now()): string {
  if (!iso) return 'Nunca';
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'Agora';
  for (const [unit, sec] of UNITS) {
    if (abs >= sec || unit === 'minute') {
      const value = Math.round(diffSec / sec);
      return capitalize(rtf.format(value, unit).replace(/\.$/, ''));
    }
  }
  return 'Agora';
}

export function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase(LOCALE) + s.slice(1);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toLocaleUpperCase(LOCALE);
}

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;
