import { useId, useState } from 'react';
import { RadioTower } from 'lucide-react';
import type { Station } from '@/types';
import { palette } from '@/theme/tokens';
import { cn } from '@/lib/cn';
import { formatCelsius, formatPercent, formatRelative } from '@/lib/formatters';
import { STATUS_META, statusLabel } from '../stationStatus';

interface SensorMapProps {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  now: number;
}

const W = 1000;
const H = 560;

/** Fundo do mapa: grid, rio São Francisco e áreas municipais. Puramente decorativo. */
function MapBackdrop() {
  const gridId = useId().replace(/:/g, '');
  const label = { fontSize: 13, fontWeight: 600, letterSpacing: '0.42em', fill: palette.ink.subtle } as const;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke={palette.map.grid} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={palette.map.land} />
      <rect width={W} height={H} fill={`url(#${gridId})`} />

      {/* Áreas municipais */}
      <ellipse cx="250" cy="330" rx="215" ry="160" fill={palette.surface} fillOpacity="0.55" stroke={palette.map.area} strokeDasharray="5 6" strokeWidth="1.5" />
      <ellipse cx="790" cy="210" rx="175" ry="125" fill={palette.surface} fillOpacity="0.55" stroke={palette.map.area} strokeDasharray="5 6" strokeWidth="1.5" />

      {/* Rio São Francisco */}
      <path d="M330 600 C 430 470, 500 380, 560 290 S 650 120, 760 -40" fill="none" stroke={palette.map['river-edge']} strokeWidth="50" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M330 600 C 430 470, 500 380, 560 290 S 650 120, 760 -40" fill="none" stroke={palette.map.river} strokeWidth="42" strokeLinecap="round" />
      <text x="592" y="306" transform="rotate(-58 592 306)" style={{ ...label, fontSize: 11, fill: palette.surface, letterSpacing: '0.3em' }}>
        RIO SÃO FRANCISCO
      </text>

      <text x="250" y="512" textAnchor="middle" style={label}>PETROLINA · PE</text>
      <text x="790" y="358" textAnchor="middle" style={label}>JUAZEIRO · BA</text>
    </svg>
  );
}

interface PinProps {
  station: Station;
  selected: boolean;
  onSelect: () => void;
  now: number;
}

function Pin({ station, selected, onSelect, now }: PinProps) {
  const [hover, setHover] = useState(false);
  const meta = STATUS_META[station.status];
  const tipId = useId();
  const showTip = hover;
  // Tooltip abre para o lado com mais espaço
  const tipBelow = station.position.y < 35;

  return (
    <div
      className="absolute"
      style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onSelect}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-pressed={selected}
        aria-describedby={tipId}
        aria-label={`${station.name}, ${statusLabel(station)}`}
        className={cn(
          'group absolute -translate-x-1/2 -translate-y-full rounded-full transition-transform duration-150 ease-out hover:-translate-y-[calc(100%+2px)]',
          selected && 'z-10',
        )}
      >
        {/* Gota */}
        <span
          className={cn(
            'flex h-9 w-9 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] shadow-pop ring-[3px] ring-surface transition-[box-shadow] duration-150',
            meta.pinClass,
            selected && 'ring-brand-soft outline outline-2 outline-offset-2 outline-brand',
          )}
        >
          <RadioTower aria-hidden className="h-4 w-4 rotate-45 text-white" strokeWidth={2} />
        </span>
      </button>

      {/* Etiqueta */}
      <span className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-surface/95 px-2.5 py-0.5 text-[11px] font-semibold text-ink shadow-card">
        {station.name}
      </span>

      {/* Tooltip */}
      <div
        id={tipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-20 w-56 -translate-x-1/2 rounded-tile border border-border bg-surface p-3 text-left shadow-pop transition-opacity duration-150 ease-out',
          tipBelow ? 'top-9' : 'bottom-12',
          showTip ? 'opacity-100' : 'sr-only opacity-0',
        )}
      >
        <p className="text-xs font-semibold text-ink">{station.name}</p>
        <p className="text-[11px] text-ink-subtle">
          {station.id} · {formatRelative(station.lastReadingAt, now)}
        </p>
        {station.lastReading ? (
          <dl className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-2">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">Temp.</dt>
              <dd className="text-xs font-semibold tabular-nums text-ink">{formatCelsius(station.lastReading.temperature, 1)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">Solo</dt>
              <dd className="text-xs font-semibold tabular-nums text-ink">{formatPercent(station.lastReading.soilMoisture)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">Ar</dt>
              <dd className="text-xs font-semibold tabular-nums text-ink">{formatPercent(station.lastReading.airHumidity)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 border-t border-border pt-2 text-xs text-ink-muted">Sem leitura recente</p>
        )}
      </div>
    </div>
  );
}

export function SensorMap({ stations, selectedId, onSelect, now }: SensorMapProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-tile border border-border sm:aspect-[1000/560]">
      <MapBackdrop />

      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-card">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-brand" />
          <span className="relative h-2 w-2 rounded-full bg-brand" />
        </span>
        Monitoramento ao vivo
      </span>

      <ul className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-1 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-[11px] font-medium text-ink-muted shadow-card" aria-label="Legenda">
        {(['ATIVO', 'ATENCAO', 'INATIVO'] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span aria-hidden className={cn('h-2 w-2 rounded-full', STATUS_META[s].pinClass)} />
            {STATUS_META[s].label}
          </li>
        ))}
      </ul>

      <div role="group" aria-label="Estações no mapa" className="absolute inset-0">
        {stations.map((s) => (
          <Pin key={s.id} station={s} selected={s.id === selectedId} onSelect={() => onSelect(s.id)} now={now} />
        ))}
      </div>
    </div>
  );
}
