import { useId } from 'react';
import type { CropId, HarvestForecast } from '@/types';
import { CROPS, CROP_IDS } from '@/lib/crops';
import { formatCelsius, formatTons } from '@/lib/formatters';
import { Card, CardBody, CardHeader, ErrorState, Select, Skeleton } from '@/components/ui';
import { ChartLegend } from '@/components/charts/ChartParts';
import { HARVEST_LEGEND, HarvestChart } from './HarvestChart';

interface HarvestForecastCardProps {
  cropId: CropId;
  onCropChange: (id: CropId) => void;
  data: HarvestForecast | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

function measuredSummary(pts: HarvestForecast['points']): string {
  const measured = pts.filter((p) => p.measuredTemperatureC !== null);
  if (!measured.length) return ' A estação ainda não tem um mês completo de medições.';
  return ' Medido pela estação: ' + measured
    .map((p) => `${p.period} ${formatCelsius(p.measuredTemperatureC!, 1)} (normal ${formatCelsius(p.avgTemperatureC, 1)})`)
    .join('; ') + '.';
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
    `Normal climatológica mais quente: ${formatCelsius(hottest.avgTemperatureC, 1)} em ${hottest.period}.` +
    measuredSummary(pts)
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
        subtitle="Produção por mês e a temperatura que a acompanha — normal do Vale × medida pela estação"
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
        <ChartLegend items={HARVEST_LEGEND} className="mb-4" />
        <div className="relative h-[22rem]">
          {isError ? (
            <ErrorState message="Não foi possível carregar a previsão." onRetry={onRetry} />
          ) : isLoading || !data ? (
            <div role="status" aria-busy="true" className="h-full">
              <span className="sr-only">Carregando previsão de safra</span>
              <Skeleton className="h-full w-full rounded-tile" />
            </div>
          ) : (
            <figure className={isFetching ? 'h-full opacity-60 transition-opacity duration-150' : 'h-full transition-opacity duration-150'}>
              <div role="img" aria-label={`Gráfico de linhas em dois painéis. ${summarize(data)}`} className="h-full">
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
