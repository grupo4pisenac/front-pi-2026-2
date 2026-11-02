import type {
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
import { mockReadings } from './climateSeries';

const now = () => Date.now();
const minutesAgo = (m: number) => new Date(now() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now() - d * 86_400_000).toISOString();
const thisMonth = (day: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), Math.min(day, d.getDate()), 8).toISOString();
};

/* ─────────────────── Usuários (alinhados ao app/seed.py do back) ─────────────────── */

type Seed = [name: string, email: string, role: Role, status: UserStatus, lastAccessMin: number | null, createdAt: string];

const USER_SEED: Seed[] = [
  ['Administrador Bartô', 'admin@barto.io', 'ADMIN', 'ATIVO', 2, daysAgo(180)],
  ['Analista de Dados', 'analista@barto.io', 'ANALISTA_DADOS', 'ATIVO', 14, daysAgo(150)],
  ['Produtor Exportador', 'produtor@barto.io', 'PRODUTOR_EXPORTADOR', 'ATIVO', 25, daysAgo(140)],
  ['Marina Albuquerque', 'marina.albuquerque@barto.io', 'ADMIN', 'ATIVO', 45, daysAgo(120)],
  ['Thiago Nunes', 'thiago.nunes@barto.io', 'ANALISTA_DADOS', 'ATIVO', 90, daysAgo(95)],
  ['Pedro Amorim', 'pedro.amorim@valefrutas.com.br', 'PRODUTOR_EXPORTADOR', 'ATIVO', 180, daysAgo(80)],
  ['Ana Clara Siqueira', 'ana.siqueira@valefrutas.com.br', 'PRODUTOR_EXPORTADOR', 'ATIVO', 60 * 6, thisMonth(1)],
  ['Camila Teixeira', 'camila.teixeira@barto.io', 'ANALISTA_DADOS', 'ATIVO', 60 * 12, thisMonth(2)],
  ['Lucas Sampaio', 'lucas.sampaio@valefrutas.com.br', 'PRODUTOR_EXPORTADOR', 'INATIVO', 60 * 24 * 45, daysAgo(210)],
];

export const usersDb: User[] = USER_SEED.map(([name, email, role, status, lastMin, createdAt], i) => ({
  id: `usr_${String(i + 1).padStart(3, '0')}`,
  name,
  email,
  role,
  status,
  lastAccessAt: lastMin === null ? null : minutesAgo(lastMin),
  createdAt,
}));

export const currentUserId = 'usr_001';

/* ─────────────────── Estações (idênticas ao app/seed.py + station_service.py) ─────────────────── */

export const stationsDb: Station[] = [
  {
    id: 'ESP-PTR-01',
    name: 'Fazenda Santa Clara',
    municipality: 'PETROLINA',
    position: { x: 24.2, y: 56.8 },
    status: 'ATIVO',
    statusReason: null,
    battery: 94,
    lastReadingAt: minutesAgo(2),
    lastReading: { temperature: 31.4, soilMoisture: null, airHumidity: 44 },
    productId: 'UVA_SUGRAONE',
    thingSpeakChannelId: '2481035',
  },
  {
    id: 'ESP-PTR-02',
    name: 'Sítio Boa Esperança',
    municipality: 'PETROLINA',
    position: { x: 31.8, y: 64.2 },
    status: 'ATIVO',
    statusReason: null,
    battery: 82,
    lastReadingAt: minutesAgo(5),
    lastReading: { temperature: 32.0, soilMoisture: null, airHumidity: 41 },
    productId: 'MANGA_PALMER',
    thingSpeakChannelId: '2481036',
  },
  {
    id: 'ESP-PTR-03',
    name: 'Projeto Senador Nilo Coelho',
    municipality: 'PETROLINA',
    position: { x: 19.5, y: 49.4 },
    status: 'ATENCAO',
    statusReason: 'Checar bateria',
    battery: 16,
    lastReadingAt: minutesAgo(11),
    lastReading: { temperature: 30.8, soilMoisture: null, airHumidity: 46 },
    productId: 'UVA_ARRA',
    thingSpeakChannelId: '2481037',
  },
  {
    id: 'ESP-JZR-01',
    name: 'Fazenda Mandacaru',
    municipality: 'JUAZEIRO',
    position: { x: 73.4, y: 33.6 },
    status: 'ATIVO',
    statusReason: null,
    battery: 91,
    lastReadingAt: minutesAgo(3),
    lastReading: { temperature: 31.9, soilMoisture: null, airHumidity: 39 },
    productId: 'MANGA_PALMER',
    thingSpeakChannelId: '2481038',
  },
  {
    id: 'ESP-JZR-02',
    name: 'Vale do Salitre',
    municipality: 'JUAZEIRO',
    position: { x: 81.6, y: 44.0 },
    status: 'INATIVO',
    statusReason: 'Sem sinal',
    battery: 0,
    lastReadingAt: minutesAgo(60 * 28),
    lastReading: null,
    productId: 'GOIABA_PALUMA',
    thingSpeakChannelId: '2481039',
  },
];

/* ─────────────────── Talhões (idênticos ao TALHOES de dashboard_service.py) ─────────────────── */

export const plotsDb: Plot[] = [
  { id: 'p1', name: 'Sugraone Norte', code: 'T-04', cropId: 'UVA_SUGRAONE', areaHa: 12, daysToHarvest: 18, progress: 82 },
  { id: 'p2', name: 'Manga Palmer Leste', code: 'T-07', cropId: 'MANGA_PALMER', areaHa: 20, daysToHarvest: 34, progress: 64 },
  { id: 'p3', name: 'Arra 15 Encosta', code: 'T-11', cropId: 'UVA_ARRA', areaHa: 8, daysToHarvest: 46, progress: 51 },
  { id: 'p4', name: 'Goiaba Paluma Sul', code: 'T-02', cropId: 'GOIABA_PALUMA', areaHa: 6, daysToHarvest: 61, progress: 37 },
];

/* ─────────────────── Clima e Previsão (mesmas regras do dashboard_service.py) ─────────────────── */

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function buildSummary(): DashboardSummary {
  const readings24h = mockReadings('24h');
  const readings30d = mockReadings('30d');
  const last = readings24h[readings24h.length - 1] ?? readings30d[readings30d.length - 1];

  const avg24h = mean(readings24h.map((r) => r.temperature));
  const avg30d = mean(readings30d.map((r) => r.temperature));
  const hum24h = mean(readings24h.map((r) => r.airHumidity));

  // Atualiza também a leitura ao vivo da estação principal ESP-PTR-01
  if (last && stationsDb[0]) {
    stationsDb[0].lastReadingAt = last.timestamp;
    stationsDb[0].lastReading = {
      temperature: last.temperature,
      soilMoisture: last.soilMoisture,
      airHumidity: last.airHumidity,
    };
  }

  return {
    projectedProductionT: 1248,
    productionChangePct: 8.2,
    avgTemperatureC: avg24h,
    temperatureDeltaC: avg24h !== null && avg30d !== null ? Math.round((avg24h - avg30d) * 10) / 10 : null,
    airHumidityPct: hum24h,
    soilMoisturePct: null,
    rainfall7dMm: null,
    lastReadingAt: last?.timestamp ?? minutesAgo(1),
  };
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const TEMPS = [30.2, 29.8, 29.1, 28.4, 27.2, 26.1, 25.9, 27.0, 29.3, 31.0, 31.8, 31.2];
export const PRODUCTION_BY_CROP: Record<CropId, number[]> = {
  UVA_SUGRAONE: [62, 70, 78, 84, 92, 88, 96, 108, 118, 126, 134, 140],
  MANGA_PALMER: [120, 110, 96, 84, 80, 92, 104, 128, 152, 170, 186, 178],
  UVA_ARRA: [44, 50, 56, 60, 66, 63, 70, 78, 86, 92, 98, 101],
  GOIABA_PALUMA: [30, 32, 35, 38, 36, 34, 37, 41, 45, 48, 52, 50],
};

export function buildForecast(cropId: CropId): HarvestForecast {
  const currentMonth = new Date().getMonth();
  const readings30d = mockReadings('30d');
  const measuredAvg = mean(readings30d.map((r) => r.temperature));

  return {
    cropId,
    points: MONTHS.map((period, i) => ({
      period,
      productionT: PRODUCTION_BY_CROP[cropId][i] ?? 0,
      avgTemperatureC: TEMPS[i] ?? 0,
      measuredTemperatureC:
        i === currentMonth && measuredAvg !== null
          ? measuredAvg
          : i === currentMonth - 1
            ? Math.round(((TEMPS[i] ?? 0) + 0.6) * 10) / 10
            : null,
      projected: i > currentMonth,
    })),
  };
}

export function buildActiveAlert(): ThermalAlert | null {
  const readings24h = mockReadings('24h');
  if (!readings24h.length) return null;
  const peak = readings24h.reduce((a, b) => (b.temperature > a.temperature ? b : a));
  if (peak.temperature < 35.0) return null;
  const critical = peak.temperature >= 38.0;
  const timeFmt = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Recife',
  }).format(new Date(peak.timestamp));
  const tempStr = peak.temperature.toFixed(1).replace('.', ',');
  return {
    id: `alt_${peak.id}`,
    title: critical ? 'Alerta térmico crítico' : 'Alerta térmico',
    message:
      `Pico de ${tempStr} °C registrado às ${timeFmt} nas últimas 24 h. ` +
      (critical
        ? 'Risco alto de estresse hídrico — reforce a irrigação no início da manhã.'
        : 'Acompanhe a demanda de irrigação nas horas mais quentes.'),
    severity: critical ? 'critico' : 'atencao',
  };
}

export const activeAlert: ThermalAlert = buildActiveAlert() ?? {
  id: 'alt_01',
  title: 'Alerta térmico',
  message: 'Pico acima de 35 °C registrado nas últimas 24 h. Acompanhe a demanda de irrigação nas horas mais quentes.',
  severity: 'atencao',
};
