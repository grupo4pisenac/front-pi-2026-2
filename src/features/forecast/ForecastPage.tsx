import { useId, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { Calendar, CheckCircle2, Layers, MapPin, Pencil, Sprout, TrendingUp } from 'lucide-react';
import type { CropId, HarvestForecast } from '@/types';
import { CROPS, CROP_IDS, getCrop } from '@/lib/crops';
import { cn } from '@/lib/cn';
import { formatInteger, formatPercent, formatTons, THIN } from '@/lib/formatters';
import { dashboardService } from '@/services/dashboardService';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, CardBody, CardHeader, ProgressBar, Skeleton, StatCard } from '@/components/ui';
import { Can } from '@/components/auth/Can';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartLegend, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { gridProps, tickStyle } from '@/components/charts/chartTheme';
import { useActivePlots, useHarvestForecast } from '@/features/dashboard/queries';
import { HarvestForecastCard } from '@/features/dashboard/components/HarvestForecastCard';
import { EditForecastModal } from './components/EditForecastModal';

const CROP_IMAGES: Record<CropId, string> = {
  UVA_SUGRAONE: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
  MANGA_PALMER: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  UVA_ARRA: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80',
  GOIABA_PALUMA: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80',
  UVA_MOSCATEL: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80',
};
const FALLBACK_CROP_IMAGE = CROP_IMAGES.UVA_SUGRAONE;

type MultiCropPoint = { period: string; total: number } & Record<CropId, number>;

function MultiCropTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as MultiCropPoint | undefined;
  return (
    <TooltipShell title={`${label} · Total ${formatTons(p?.total ?? 0)}`}>
      {CROP_IDS.map((id) => (
        <TooltipRow
          key={id}
          color={CROPS[id].color}
          shape="rect"
          label={CROPS[id].label}
          value={formatTons(p?.[id] ?? 0)}
        />
      ))}
    </TooltipShell>
  );
}

export function ForecastPage() {
  const [selectedCrop, setSelectedCrop] = useState<CropId>('UVA_SUGRAONE');
  const [editOpen, setEditOpen] = useState(false);
  const plots = useActivePlots();
  const forecast = useHarvestForecast(selectedCrop);
  const compareTitleId = useId();

  // Busca as séries de todas as culturas diretamente do endpoint /forecasts/harvest do backend
  const allForecasts = useQueries({
    queries: CROP_IDS.map((id) => ({
      queryKey: ['dashboard', 'forecast', id] as const,
      queryFn: () => dashboardService.getHarvestForecast(id),
    })),
  });

  const multiCropData = useMemo<MultiCropPoint[]>(() => {
    const byCrop = new Map<CropId, HarvestForecast>();
    allForecasts.forEach((q, idx) => {
      if (q.data) byCrop.set(CROP_IDS[idx]!, q.data);
    });
    const base = byCrop.get('UVA_SUGRAONE')?.points ?? [];
    return base.map((pt, i) => {
      const point = { period: pt.period, total: 0 } as MultiCropPoint;
      for (const id of CROP_IDS) {
        const value = byCrop.get(id)?.points[i]?.productionT ?? 0;
        point[id] = value;
        point.total += value;
      }
      return point;
    });
  }, [allForecasts]);

  const stats = useMemo(() => {
    const list = plots.data ?? [];
    const totalArea = list.reduce((acc, p) => acc + p.areaHa, 0);
    const avgProgress = list.length ? Math.round(list.reduce((acc, p) => acc + p.progress, 0) / list.length) : 0;
    const nextPlot = list.length ? list.reduce((a, b) => (b.daysToHarvest < a.daysToHarvest ? b : a)) : null;
    const cropPts = forecast.data?.points ?? [];
    const cropAnnualT = cropPts.reduce((acc, p) => acc + p.productionT, 0);
    const cropPeak = cropPts.length ? cropPts.reduce((a, b) => (b.productionT > a.productionT ? b : a)) : null;
    return { totalArea, avgProgress, nextPlot, cropAnnualT, cropPeak };
  }, [plots.data, forecast.data]);

  const isCompareLoading = allForecasts.some((q) => q.isLoading);
  const isCompareError = allForecasts.some((q) => q.isError);

  return (
    <>
      <PageHeader
        eyebrow="Planejamento Agrícola"
        title="Safra & Talhões"
        subtitle="Projeções mensais de colheita por cultura, correlação térmica (normal climatológica × estação) e ciclo fenológico dos lotes ativos."
        action={
          <Can permission="forecast:write">
            <Button variant="primary" leftIcon={<Pencil aria-hidden className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Editar parâmetros
            </Button>
          </Can>
        }
      />
      <EditForecastModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialCrop={selectedCrop}
        onSaved={setSelectedCrop}
      />

      <div className="space-y-8">
        {/* KPIs de Safra */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={`Volume anual · ${getCrop(selectedCrop).short}`}
            icon={TrendingUp}
            value={
              <>
                {formatInteger(stats.cropAnnualT)}
                <span className="text-lg font-medium text-ink-muted">{THIN}t</span>
              </>
            }
            helper={stats.cropPeak ? `Pico em ${stats.cropPeak.period} (${formatTons(stats.cropPeak.productionT)})` : 'Soma dos 12 meses'}
          />
          <StatCard
            label="Área produtiva monitorada"
            icon={Layers}
            value={
              <>
                {formatInteger(stats.totalArea)}
                <span className="text-lg font-medium text-ink-muted">{THIN}ha</span>
              </>
            }
            helper={`${plots.data?.length ?? 4} talhões ativos em produção`}
          />
          <StatCard
            label="Próxima janela de colheita"
            icon={Calendar}
            tone="accent"
            value={
              stats.nextPlot ? (
                <>
                  {formatInteger(stats.nextPlot.daysToHarvest)}
                  <span className="text-lg font-medium text-ink-muted">{THIN}dias</span>
                </>
              ) : (
                '—'
              )
            }
            helper={stats.nextPlot ? `${stats.nextPlot.name} (${stats.nextPlot.code})` : 'Calculando ciclo'}
          />
          <StatCard
            label="Avanço médio fenológico"
            icon={CheckCircle2}
            value={formatPercent(stats.avgProgress)}
            helper="Média dos talhões em ciclo ativo"
          />
        </div>

        {/* Seletor visual de culturas e talhões com imagem */}
        <section aria-label="Culturas e talhões monitorados">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Lotes por cultura de exportação</h2>
              <p className="text-[13px] text-ink-muted">
                Selecione uma cultura para inspecionar sua curva de safra e temperatura abaixo.
              </p>
            </div>
          </div>

          {plots.isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-card" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {(plots.data ?? []).map((plot) => {
                const crop = getCrop(plot.cropId);
                const isSelected = selectedCrop === plot.cropId;
                return (
                  <button
                    key={plot.id}
                    type="button"
                    onClick={() => setSelectedCrop(plot.cropId)}
                    aria-pressed={isSelected}
                    className={cn(
                      'group flex flex-col overflow-hidden rounded-card border bg-surface text-left transition-all duration-150',
                      isSelected
                        ? 'border-brand ring-2 ring-brand/25 shadow-pop'
                        : 'border-border shadow-card hover:border-border-strong',
                    )}
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-neutral-soft">
                      <img
                        src={CROP_IMAGES[plot.cropId] ?? FALLBACK_CROP_IMAGE}
                        alt={crop.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className="rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          Talhão {plot.code}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                        <div>
                          <p className="text-xs font-medium text-white/80">{crop.label}</p>
                          <p className="text-sm font-semibold">{plot.name}</p>
                        </div>
                        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                          {plot.areaHa} ha
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Sprout aria-hidden className={cn('h-3.5 w-3.5', crop.textClass)} />
                          Colheita em {plot.daysToHarvest} dias
                        </span>
                        <span className="font-semibold tabular-nums text-ink">{formatPercent(plot.progress)}</span>
                      </div>
                      <ProgressBar
                        value={plot.progress}
                        barClass={crop.bgClass}
                        label={`${plot.name}: ${formatPercent(plot.progress)}`}
                        className="mt-2.5"
                      />
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-ink-subtle">
                          <MapPin aria-hidden className="h-3 w-3" />
                          Vale do São Francisco
                        </span>
                        <Badge tone={plot.daysToHarvest <= 25 ? 'warning' : 'success'} dot>
                          {plot.daysToHarvest <= 25 ? 'Reta final' : 'Em maturação'}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Gráfico principal de Previsão + Temperatura da cultura selecionada */}
        <HarvestForecastCard
          cropId={selectedCrop}
          onCropChange={setSelectedCrop}
          data={forecast.data}
          isLoading={forecast.isLoading}
          isFetching={forecast.isFetching && !forecast.isLoading}
          isError={forecast.isError}
          onRetry={() => forecast.refetch()}
        />

        {/* Gráfico comparativo anual entre todas as 4 culturas do backend */}
        <Card aria-labelledby={compareTitleId}>
          <CardHeader
            titleId={compareTitleId}
            title="Comparativo sazonal de produção por cultura"
            subtitle="Volume mensal (toneladas) das quatro culturas monitoradas ao longo do ano agrícola"
            action={
              <ChartLegend
                items={CROP_IDS.map((id) => ({
                  label: CROPS[id].label,
                  color: CROPS[id].color,
                  shape: 'rect' as const,
                }))}
              />
            }
          />
          <CardBody>
            <ChartFrame
              className="h-80"
              isLoading={isCompareLoading}
              isError={isCompareError}
              onRetry={() => allForecasts.forEach((q) => q.refetch())}
              isEmpty={multiCropData.length === 0}
              summary="Gráfico de colunas agrupadas comparando a produção mensal em toneladas de Uva Sugraone, Manga Palmer, Uva Arra 15 e Goiaba Paluma."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiCropData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barGap={3} barCategoryGap="18%">
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={tickStyle} height={28} dy={6} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={tickStyle}
                    width={52}
                    tickFormatter={(v: number) => `${formatInteger(v)} t`}
                  />
                  <Tooltip
                    content={<MultiCropTooltip />}
                    cursor={{ fill: 'rgb(var(--color-border) / 0.4)' }}
                    isAnimationActive={false}
                  />
                  {CROP_IDS.map((id) => (
                    <Bar
                      key={id}
                      dataKey={id}
                      name={CROPS[id].label}
                      fill={CROPS[id].color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={18}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
