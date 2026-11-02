import { Link } from 'react-router-dom';
import { ArrowUpRight, CloudSun, Download, Droplets, MapPin, RadioTower } from 'lucide-react';
import { formatRelative } from '@/lib/formatters';

interface AgroHeroBannerProps {
  greeting: string;
  lastReadingAt: string | null | undefined;
  now: number;
  avgTemp: number | null | undefined;
  airHumidity: number | null | undefined;
  onExport?: () => void;
  canExport?: boolean;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80';

export function AgroHeroBanner({
  greeting,
  lastReadingAt,
  now,
  avgTemp,
  airHumidity,
  onExport,
  canExport = false,
}: AgroHeroBannerProps) {
  return (
    <section
      aria-label="Resumo executivo da operação"
      className="relative mb-8 overflow-hidden rounded-card border border-border bg-[#0D2618] text-white shadow-card"
    >
      {/* Imagem de fundo com sobreposição editorial */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#091C12]/95 via-[#0E291B]/88 to-[#133824]/70"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-emerald-100/90">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-emerald-400" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {lastReadingAt ? `Telemetria ativa · ${formatRelative(lastReadingAt, now)}` : 'Sincronizando telemetria…'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-emerald-100/80">
              <MapPin aria-hidden className="h-3.5 w-3.5 text-emerald-300" />
              Vale do São Francisco · PE/BA
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-emerald-100/80 sm:inline-flex">
              <RadioTower aria-hidden className="h-3.5 w-3.5 text-amber-300" />
              ESP32 + ThingSpeak
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {greeting}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-emerald-100/80">
              Monitoramento agrometeorológico contínuo de temperatura, umidade relativa, demanda evaporativa (VPD) e
              previsão de colheita para fruticultura irrigada de exportação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link
              to="/clima"
              className="inline-flex h-9 items-center gap-1.5 rounded-tile bg-emerald-500 px-4 text-xs font-semibold text-slate-950 shadow-sm transition-colors hover:bg-emerald-400"
            >
              <CloudSun aria-hidden className="h-3.5 w-3.5" />
              Análise climática
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/irrigacao"
              className="inline-flex h-9 items-center gap-1.5 rounded-tile border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <Droplets aria-hidden className="h-3.5 w-3.5 text-cyan-300" />
              Janela de irrigação
            </Link>
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={!canExport}
                className="inline-flex h-9 items-center gap-1.5 rounded-tile border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-emerald-100 transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                <Download aria-hidden className="h-3.5 w-3.5" />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Mini resumo rápido lateral */}
        <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
          <div className="rounded-tile border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/70">Média 24 h</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-white">
              {avgTemp != null ? `${avgTemp.toFixed(1).replace('.', ',')} °C` : '—'}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-100/70">Temperatura do ar</p>
          </div>
          <div className="rounded-tile border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/70">Umidade 24 h</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-white">
              {airHumidity != null ? `${Math.round(airHumidity)}%` : '—'}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-100/70">Umidade relativa</p>
          </div>
        </div>
      </div>
    </section>
  );
}

