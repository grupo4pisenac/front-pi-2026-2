import type { ClimateReading } from '@/types';
import { formatTime } from '@/lib/formatters';
import { downloadFile, toCsv } from '@/lib/csv';

export function exportReadings(readings: ClimateReading[]) {
  const csv = toCsv(readings, [
    { header: 'Data/hora', value: (r) => new Date(r.timestamp).toLocaleString('pt-BR') },
    { header: 'Horário', value: (r) => formatTime(r.timestamp) },
    { header: 'Estação', value: (r) => r.stationId },
    { header: 'Temperatura (°C)', value: (r) => r.temperature.toLocaleString('pt-BR') },
    { header: 'Umidade do ar (%)', value: (r) => r.airHumidity },
    { header: 'Umidade do solo (%)', value: (r) => r.soilMoisture ?? '' },
    { header: 'Chuva (mm)', value: (r) => r.rainfall?.toLocaleString('pt-BR') ?? '' },
  ]);
  downloadFile(csv, `barto-historico-climatico-${new Date().toISOString().slice(0, 10)}.csv`);
}
