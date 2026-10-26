import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { chartColors } from '@/theme/tokens';

interface SparklineProps {
  values: number[];
  /** Cor do ponto atual (a série); a linha fica na cor de recuo */
  color: string;
  label: string;
}

/** Pontos do minigráfico — mais que isso vira ruído numa linha de 40 px */
const MAX_POINTS = 24;

/** Média por blocos iguais: preserva a forma da tendência sem o serrilhado das leituras */
function smooth(values: number[]): number[] {
  if (values.length <= MAX_POINTS) return values;
  const size = values.length / MAX_POINTS;
  return Array.from({ length: MAX_POINTS }, (_, i) => {
    const chunk = values.slice(Math.floor(i * size), Math.floor((i + 1) * size));
    return chunk.reduce((a, b) => a + b, 0) / chunk.length;
  });
}

/** Tendência compacta para cartões de KPI: linha em tom de recuo, ponto atual na cor da série. */
export function Sparkline({ values, color, label }: SparklineProps) {
  if (values.length < 2) return null;
  const data = smooth(values).map((v, i) => ({ i, v }));
  const last = data.length - 1;
  return (
    <div role="img" aria-label={label} className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            dataKey="v"
            type="monotone"
            stroke={chartColors.reference}
            strokeWidth={1.5}
            isAnimationActive={false}
            dot={(p: { index?: number; cx?: number; cy?: number }) =>
              p.index === last && p.cx !== undefined && p.cy !== undefined ? (
                <circle key="end" cx={p.cx} cy={p.cy} r={3.5} fill={color} stroke={chartColors.surface} strokeWidth={2} />
              ) : (
                <g key={p.index} />
              )
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
