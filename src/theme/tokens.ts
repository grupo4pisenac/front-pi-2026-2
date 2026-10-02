/**
 * Fonte única de verdade dos design tokens.
 * Consumido pelo tailwind.config.ts (classes utilitárias) e pelos gráficos/SVG
 * (que precisam do valor bruto). Nenhum componente declara cor literal.
 */
export const palette = {
  canvas: '#F6F4EE',
  surface: '#FDFCF9',
  border: '#E8E4DA',
  'border-strong': '#D9D3C5',
  ink: {
    DEFAULT: '#1F2A22',
    muted: '#5B6359',
    subtle: '#7E847B', // escurecido de #8E948B para atingir AA (4.5:1) sobre surface
  },
  brand: {
    DEFAULT: '#2F5A3C',
    hover: '#264B31',
    soft: '#E6EEE7',
  },
  accent: {
    DEFAULT: '#C9662B', // texto/ícone em laranja (AA); o laranja vivo fica em accent-vivid
    vivid: '#D9773A',
    soft: '#FBEADF',
  },
  danger: {
    DEFAULT: '#C5483B',
    soft: '#F7E3E0',
  },
  neutral: {
    DEFAULT: '#A3A79E',
    soft: '#EFEDE6',
  },
  // Cores categóricas das culturas — sempre acompanhadas de ícone + nome (codificação secundária)
  crop: {
    grape: '#3E7A4C',
    'grape-soft': '#E4EEE6',
    mango: '#D9773A',
    'mango-soft': '#FBEADF',
    arra: '#8A6FD0',
    'arra-soft': '#ECE8F7',
    guava: '#1F8199',
    'guava-soft': '#E0EEF2',
  },
  map: {
    land: '#F1EEE4',
    grid: '#E6E1D4',
    river: '#A9CAD6',
    'river-edge': '#8DB7C6',
    area: '#C9C2AF',
  },
} as const;

/** Fundos determinísticos para avatares (texto sempre em ink). */
export const avatarPalette = [
  '#E6EEE7',
  '#FBEADF',
  '#ECE8F7',
  '#E0EEF2',
  '#F3EBD3',
  '#EFE3E6',
] as const;

/** Valores brutos para Recharts/SVG. */
export const chartColors = {
  production: palette.brand.DEFAULT,
  temperature: palette.accent.vivid,
  grid: palette.border,
  axis: palette.ink.subtle,
  surface: palette.surface,
} as const;

export const fontFamily = ['Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'];
