import type {
  ClimateReading,
  CropId,
  DashboardSummary,
  HarvestForecast,
  Plot,
  Role,
  Station,
  ThermalAlert,
  User,
  UserStatus,
} from '@/types';

const now = () => Date.now();
const minutesAgo = (m: number) => new Date(now() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now() - d * 86_400_000).toISOString();
const thisMonth = (day: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), Math.min(day, d.getDate()), 8).toISOString();
};

/* ─────────────────────────── Usuários ─────────────────────────── */

type Seed = [name: string, role: Role, status: UserStatus, lastAccessMin: number | null, createdAt: string];

const USER_SEED: Seed[] = [
  ['Marina Albuquerque', 'ADMIN', 'ATIVO', 3, daysAgo(410)],
  ['Rafael Coelho', 'ADMIN', 'ATIVO', 95, daysAgo(380)],
  ['Juliana Matos', 'ADMIN', 'ATIVO', 60 * 26, daysAgo(300)],
  ['Thiago Nunes', 'ANALISTA_DADOS', 'ATIVO', 12, daysAgo(240)],
  ['Beatriz Lacerda', 'ANALISTA_DADOS', 'ATIVO', 45, daysAgo(220)],
  ['Caio Menezes', 'ANALISTA_DADOS', 'ATIVO', 60 * 5, daysAgo(190)],
  ['Larissa Freire', 'ANALISTA_DADOS', 'INATIVO', 60 * 24 * 40, daysAgo(400)],
  ['Pedro Amorim', 'PRODUTOR_EXPORTADOR', 'ATIVO', 8, daysAgo(160)],
  ['Ana Clara Siqueira', 'PRODUTOR_EXPORTADOR', 'ATIVO', 30, daysAgo(150)],
  ['José Ribamar Leite', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 3, daysAgo(140)],
  ['Fernanda Brito', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 8, daysAgo(130)],
  ['Gustavo Rocha', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 2, daysAgo(120)],
  ['Isabela Cavalcanti', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 3, daysAgo(110)],
  ['Lucas Sampaio', 'PRODUTOR_EXPORTADOR', 'INATIVO', 60 * 24 * 75, daysAgo(350)],
  ['Mariana Torres', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 4, daysAgo(95)],
  ['Otávio Barreto', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 6, daysAgo(80)],
  ['Patrícia Gondim', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 9, daysAgo(70)],
  ['Renato Queiroz', 'PRODUTOR_EXPORTADOR', 'INATIVO', 60 * 24 * 120, daysAgo(330)],
  ['Sofia Pimentel', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 12, daysAgo(60)],
  ['Vinícius Araújo', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 24 * 15, daysAgo(45)],
  ['Camila Teixeira', 'ANALISTA_DADOS', 'ATIVO', 60 * 2, thisMonth(1)],
  ['Diego Fontes', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 6, thisMonth(1)],
  ['Elisa Moura', 'PRODUTOR_EXPORTADOR', 'ATIVO', null, thisMonth(2)],
  ['Henrique Paiva', 'PRODUTOR_EXPORTADOR', 'ATIVO', 20, thisMonth(2)],
];

const slug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(' ')
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('.');

export const usersDb: User[] = USER_SEED.map(([name, role, status, lastMin, createdAt], i) => ({
  id: `usr_${String(i + 1).padStart(3, '0')}`,
  name,
  email: `${slug(name)}@valefrutas.com.br`,
  role,
  status,
  lastAccessAt: lastMin === null ? null : minutesAgo(lastMin),
  createdAt,
}));

export const currentUserId = 'usr_001';

/* ─────────────────────────── Estações ─────────────────────────── */

export const stationsDb: Station[] = [
  {
    id: 'ESP-PTR-01',
    name: 'Fazenda Santa Clara',
    municipality: 'PETROLINA',
    position: { x: 24, y: 58 },
    status: 'ATIVO',
    statusReason: null,
    battery: 86,
    lastReadingAt: minutesAgo(2),
    lastReading: { temperature: 31.4, soilMoisture: 47, airHumidity: 38 },
    productId: 'UVA_SUGRAONE',
    thingSpeakChannelId: '2481035',
  },
  {
    id: 'ESP-PTR-02',
    name: 'Sítio Boa Esperança',
    municipality: 'PETROLINA',
    position: { x: 36, y: 74 },
    status: 'ATIVO',
    statusReason: null,
    battery: 72,
    lastReadingAt: minutesAgo(4),
    lastReading: { temperature: 32.1, soilMoisture: 44, airHumidity: 36 },
    productId: 'MANGA_PALMER',
    thingSpeakChannelId: '2481036',
  },
  {
    id: 'ESP-PTR-03',
    name: 'Projeto Senador Nilo Coelho',
    municipality: 'PETROLINA',
    position: { x: 15, y: 40 },
    status: 'ATENCAO',
    statusReason: 'Checar bateria',
    battery: 14,
    lastReadingAt: minutesAgo(11),
    lastReading: { temperature: 30.8, soilMoisture: 41, airHumidity: 40 },
    productId: 'UVA_ARRA',
    thingSpeakChannelId: '2481037',
  },
  {
    id: 'ESP-JZR-01',
    name: 'Fazenda Mandacaru',
    municipality: 'JUAZEIRO',
    position: { x: 72, y: 30 },
    status: 'ATIVO',
    statusReason: null,
    battery: 91,
    lastReadingAt: minutesAgo(1),
    lastReading: { temperature: 31.9, soilMoisture: 49, airHumidity: 35 },
    productId: 'MANGA_PALMER',
    thingSpeakChannelId: '2481038',
  },
  {
    id: 'ESP-JZR-02',
    name: 'Vale do Salitre',
    municipality: 'JUAZEIRO',
    position: { x: 84, y: 46 },
    status: 'INATIVO',
    statusReason: 'Sem sinal',
    battery: 0,
    lastReadingAt: minutesAgo(60 * 26),
    lastReading: null,
    productId: 'GOIABA_PALUMA',
    thingSpeakChannelId: '2481039',
  },
];

/* ─────────────────────────── Talhões ─────────────────────────── */

export const plotsDb: Plot[] = [
  { id: 'p1', name: 'Sugraone Norte', code: 'T-04', cropId: 'UVA_SUGRAONE', areaHa: 12, daysToHarvest: 18, progress: 82 },
  { id: 'p2', name: 'Manga Palmer Leste', code: 'T-07', cropId: 'MANGA_PALMER', areaHa: 20, daysToHarvest: 34, progress: 64 },
  { id: 'p3', name: 'Arra 15 Encosta', code: 'T-11', cropId: 'UVA_ARRA', areaHa: 8, daysToHarvest: 46, progress: 51 },
  { id: 'p4', name: 'Goiaba Paluma Sul', code: 'T-02', cropId: 'GOIABA_PALUMA', areaHa: 6, daysToHarvest: 61, progress: 37 },
];

/* ─────────────────────────── Clima ─────────────────────────── */

export function buildTodayReadings(): ClimateReading[] {
  const base = [
    { t: 24.6, soil: 52, air: 64, rain: 0 },
    { t: 25.8, soil: 51, air: 58, rain: 0 },
    { t: 28.9, soil: 50, air: 49, rain: 0 },
    { t: 31.7, soil: 48, air: 41, rain: 0 },
    { t: 33.4, soil: 46, air: 36, rain: 0 },
    { t: 34.1, soil: 45, air: 33, rain: 0.4 },
    { t: 32.2, soil: 46, air: 38, rain: 1.2 },
    { t: 31.0, soil: 46, air: 40, rain: 0 },
  ];
  // Última leitura há 1 min; anteriores a cada 2 h
  return base.map((b, i) => ({
    id: `rd_${i}`,
    stationId: 'ESP-PTR-01',
    timestamp: minutesAgo(1 + (base.length - 1 - i) * 120),
    temperature: b.t,
    soilMoisture: b.soil,
    airHumidity: b.air,
    rainfall: b.rain,
  }));
}

export function buildSummary(): DashboardSummary {
  return {
    projectedProductionT: 1248,
    productionChangePct: 8.2,
    avgTemperatureC: 31,
    temperatureDeltaC: 2,
    soilMoisturePct: 46,
    rainfall7dMm: 12,
    lastReadingAt: minutesAgo(1),
  };
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const TEMPS = [30.2, 29.8, 29.1, 28.4, 27.2, 26.1, 25.9, 27.0, 29.3, 31.0, 31.8, 31.2];
const PRODUCTION: Record<CropId, number[]> = {
  UVA_SUGRAONE: [62, 70, 78, 84, 92, 88, 96, 108, 118, 126, 134, 140],
  MANGA_PALMER: [120, 110, 96, 84, 80, 92, 104, 128, 152, 170, 186, 178],
  UVA_ARRA: [44, 50, 56, 60, 66, 63, 70, 78, 86, 92, 98, 101],
  GOIABA_PALUMA: [30, 32, 35, 38, 36, 34, 37, 41, 45, 48, 52, 50],
};

export function buildForecast(cropId: CropId): HarvestForecast {
  const currentMonth = new Date().getMonth();
  return {
    cropId,
    points: MONTHS.map((period, i) => ({
      period,
      productionT: PRODUCTION[cropId][i] ?? 0,
      avgTemperatureC: TEMPS[i] ?? 0,
      projected: i > currentMonth,
    })),
  };
}

export const activeAlert: ThermalAlert = {
  id: 'alt_01',
  title: 'Alerta térmico',
  message: 'Previsão de 38 °C nas próximas 48 h no Talhão T-04. Estresse hídrico provável na Sugraone.',
  severity: 'atencao',
};
