import { useId } from 'react';
import type { CropId, HarvestForecast } from '@/types';
import { CROPS, CROP_IDS } from '@/lib/crops';
import { formatCelsius, formatTons } from '@/lib/formatters';
import { Card, CardBody, CardHeader, ErrorState, Select, Skeleton } from '@/components/ui';
import { HarvestChart } from './HarvestChart';

interface HarvestForecastCardProps {
  cropId: CropId;
  onCropChange: (id: CropId) => void;
  data: HarvestForecast | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

function summarize(f: HarvestForecast): string {
  const pts = f.points;
  if (!pts.length) return '';
  const peak = pts.reduce((a, b) => (b.productionT > a.productionT ? b : a));
  const hottest = pts.reduce((a, b) => (b.avgTemperatureC > a.avgTemperatureC ? b : a));
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  return (
    `${CROPS[f.cropId].label}: produção vai de ${formatTons(first.productionT)} em ${first.period} ` +
    `a ${formatTons(last.productionT)} em ${last.period}, com pico de ${formatTons(peak.productionT)} em ${peak.period}. ` +
    `Temperatura média máxima de ${formatCelsius(hottest.avgTemperatureC, 1)} em ${hottest.period}.`
  );
}

function Legend() {
  return (
    <ul className="flex items-center gap-5 text-xs font-medium text-ink-muted" aria-hidden>
      <li className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full bg-brand" />
        Produção projetada
      </li>
      <li className="flex items-center gap-2">
        <span className="w-4 border-t-2 border-dashed border-accent-vivid" />
        Temperatura média
      </li>
    </ul>
  );
}

export function HarvestForecastCard({ cropId, onCropChange, data, isLoading, isError, isFetching, onRetry }: HarvestForecastCardProps) {
  const titleId = useId();
  const selectId = useId();

  return (
    <Card aria-labelledby={titleId} className="flex flex-col">
      <CardHeader
        titleId={titleId}
        title="Previsão de safra"
        subtitle="Produção projetada × temperatura média, por mês"
        action={
          <>
            <label htmlFor={selectId} className="sr-only">
              Cultura
            </label>
            <Select
              id={selectId}
              value={cropId}
              onChange={(e) => onCropChange(e.target.value as CropId)}
              className="h-9 w-44 text-[13px] font-medium"
            >
              {CROP_IDS.map((id) => (
                <option key={id} value={id}>
                  {CROPS[id].label}
                </option>
              ))}
            </Select>
          </>
        }
      />
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-4 flex justify-end">
          <Legend />
        </div>
        <div className="relative h-72 flex-1">
          {isError ? (
            <ErrorState message="Não foi possível carregar a previsão." onRetry={onRetry} />
          ) : isLoading || !data ? (
            <div role="status" aria-busy="true" className="h-full">
              <span className="sr-only">Carregando previsão de safra</span>
              <Skeleton className="h-full w-full rounded-tile" />
            </div>
          ) : (
            <figure className={isFetching ? 'h-full opacity-60 transition-opacity duration-150' : 'h-full transition-opacity duration-150'}>
              <div role="img" aria-label={`Gráfico de linhas. ${summarize(data)}`} className="h-full">
                <HarvestChart points={data.points} />
              </div>
              <figcaption className="sr-only">{summarize(data)}</figcaption>
            </figure>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
