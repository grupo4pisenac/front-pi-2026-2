/**
 * Fonte única de verdade dos design tokens com suporte nativo a Light Mode e Dark Mode
 * via variáveis CSS definidas em src/index.css.
 */
const hexVar = (name: string) => `var(${name})`;
const twColor = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export const tailwindColors = {
  canvas: twColor('--color-canvas'),
  surface: twColor('--color-surface'),
  border: twColor('--color-border'),
  'border-strong': twColor('--color-border-strong'),
  ink: {
    DEFAULT: twColor('--color-ink'),
    muted: twColor('--color-ink-muted'),
    subtle: twColor('--color-ink-subtle'),
  },
  brand: {
    DEFAULT: twColor('--color-brand'),
    hover: twColor('--color-brand-hover'),
    soft: twColor('--color-brand-soft'),
  },
  accent: {
    DEFAULT: twColor('--color-accent'),
    vivid: twColor('--color-accent-vivid'),
    soft: twColor('--color-accent-soft'),
  },
  danger: {
    DEFAULT: twColor('--color-danger'),
    soft: twColor('--color-danger-soft'),
  },
  neutral: {
    DEFAULT: twColor('--color-neutral'),
    soft: twColor('--color-neutral-soft'),
  },
  crop: {
    grape: twColor('--color-crop-grape'),
    'grape-soft': twColor('--color-crop-grape-soft'),
    mango: twColor('--color-crop-mango'),
    'mango-soft': twColor('--color-crop-mango-soft'),
    arra: twColor('--color-crop-arra'),
    'arra-soft': twColor('--color-crop-arra-soft'),
    guava: twColor('--color-crop-guava'),
    'guava-soft': twColor('--color-crop-guava-soft'),
    moscatel: twColor('--color-crop-moscatel'),
    'moscatel-soft': twColor('--color-crop-moscatel-soft'),
  },
  map: {
    land: twColor('--color-map-land'),
    grid: twColor('--color-map-grid'),
    river: twColor('--color-map-river'),
    'river-edge': twColor('--color-map-river-edge'),
    area: twColor('--color-map-area'),
  },
} as const;

export const palette = {
  canvas: hexVar('--hex-canvas'),
  surface: hexVar('--hex-surface'),
  border: hexVar('--hex-border'),
  'border-strong': hexVar('--hex-border-strong'),
  ink: {
    DEFAULT: hexVar('--hex-ink'),
    muted: hexVar('--hex-ink-muted'),
    subtle: hexVar('--hex-ink-subtle'),
  },
  brand: {
    DEFAULT: hexVar('--hex-brand'),
    hover: hexVar('--hex-brand-hover'),
    soft: hexVar('--hex-brand-soft'),
  },
  accent: {
    DEFAULT: hexVar('--hex-accent'),
    vivid: hexVar('--hex-accent-vivid'),
    soft: hexVar('--hex-accent-soft'),
  },
  danger: {
    DEFAULT: hexVar('--hex-danger'),
    soft: hexVar('--hex-danger-soft'),
  },
  neutral: {
    DEFAULT: hexVar('--hex-neutral'),
    soft: hexVar('--hex-neutral-soft'),
  },
  crop: {
    grape: hexVar('--hex-crop-grape'),
    'grape-soft': hexVar('--hex-crop-grape-soft'),
    mango: hexVar('--hex-crop-mango'),
    'mango-soft': hexVar('--hex-crop-mango-soft'),
    arra: hexVar('--hex-crop-arra'),
    'arra-soft': hexVar('--hex-crop-arra-soft'),
    guava: hexVar('--hex-crop-guava'),
    'guava-soft': hexVar('--hex-crop-guava-soft'),
    moscatel: hexVar('--hex-crop-moscatel'),
    'moscatel-soft': hexVar('--hex-crop-moscatel-soft'),
  },
  map: {
    land: hexVar('--hex-map-land'),
    grid: hexVar('--hex-map-grid'),
    river: hexVar('--hex-map-river'),
    'river-edge': hexVar('--hex-map-river-edge'),
    area: hexVar('--hex-map-area'),
  },
} as const;

/** Fundos determinísticos para avatares adaptáveis ao tema */
export const avatarPalette = [
  hexVar('--avatar-1'),
  hexVar('--avatar-2'),
  hexVar('--avatar-3'),
  hexVar('--avatar-4'),
  hexVar('--avatar-5'),
  hexVar('--avatar-6'),
] as const;

/** Valores dinâmicos (hex via CSS vars) para Recharts e SVG */
export const chartColors = {
  production: palette.brand.DEFAULT,
  temperature: palette.accent.vivid,
  humidity: palette.crop.guava,
  soilMoisture: palette.crop.arra,
  vpd: palette.brand.DEFAULT,
  reference: palette.neutral.DEFAULT,
  threshold: palette.accent.DEFAULT,
  critical: palette.danger.DEFAULT,
  grid: palette.border,
  axis: palette.ink.subtle,
  surface: palette.surface,
} as const;

/** Rampa sequencial de temperatura (claro → intenso) adaptada ao tema */
export const heatRamp = [
  'var(--heat-1)',
  'var(--heat-2)',
  'var(--heat-3)',
  'var(--heat-4)',
  'var(--heat-5)',
] as const;

export const fontFamily = ['Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'];
