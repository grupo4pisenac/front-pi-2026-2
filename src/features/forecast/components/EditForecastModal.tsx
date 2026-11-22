import { useEffect, useState, type FormEvent } from 'react';
import type { CropId } from '@/types';
import { getCrop } from '@/lib/crops';
import { ApiError } from '@/services/apiClient';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useHarvestForecast, useUpdateHarvestForecast } from '@/features/dashboard/queries';

/** Mesmo limite validado pelo back (AtualizacaoPrevisaoColheita) */
const MAX_TONS = 100_000;

/** Culturas com série de previsão no back (PRODUCAO_MENSAL); a Uva Moscatel não tem */
const EDITABLE_CROPS: CropId[] = ['UVA_SUGRAONE', 'MANGA_PALMER', 'UVA_ARRA', 'GOIABA_PALUMA'];

const firstEditable = (crop: CropId): CropId => (EDITABLE_CROPS.includes(crop) ? crop : EDITABLE_CROPS[0]!);

interface EditForecastModalProps {
  open: boolean;
  onClose: () => void;
  /** Cultura que vem selecionada ao abrir (a mesma da página) */
  initialCrop: CropId;
  /** Avisa a página qual cultura foi salva, para ela passar a exibi-la */
  onSaved?: (cropId: CropId) => void;
}

function parseTons(raw: string): number | null {
  const value = Number(raw.trim().replace(',', '.'));
  return raw.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= MAX_TONS ? value : null;
}

function saveErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Não foi possível conectar ao servidor.';
  if (err.status === 403) return 'Seu perfil não tem permissão para editar previsões.';
  return err.message || 'Não foi possível salvar os parâmetros.';
}

/** Edição da produção mensal projetada por cultura (permissão forecast:write: Analista e Admin). */
export function EditForecastModal({ open, onClose, initialCrop, onSaved }: EditForecastModalProps) {
  const [cropId, setCropId] = useState<CropId>(firstEditable(initialCrop));
  const [values, setValues] = useState<string[]>([]);
  const [loadedFor, setLoadedFor] = useState<CropId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const forecast = useHarvestForecast(cropId);
  const save = useUpdateHarvestForecast();

  // Ao abrir, começa pela cultura que está na página
  useEffect(() => {
    if (open) {
      setCropId(firstEditable(initialCrop));
      setError(null);
    } else {
      setLoadedFor(null);
    }
  }, [open, initialCrop]);

  // Preenche os campos uma vez por cultura (não sobrescreve o que o usuário já digitou se a consulta recarregar)
  useEffect(() => {
    const data = forecast.data;
    if (!open || !data || data.cropId !== cropId || loadedFor === cropId) return;
    setValues(data.points.map((p) => String(p.productionT)));
    setLoadedFor(cropId);
  }, [open, cropId, forecast.data, loadedFor]);

  const points = forecast.data?.cropId === cropId ? forecast.data.points : [];
  const ready = loadedFor === cropId && points.length === 12;
  const invalid = values.map((v) => parseTons(v) === null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    if (invalid.some(Boolean)) {
      setError(`Preencha os 12 meses com valores entre 0 e ${MAX_TONS.toLocaleString('pt-BR')} t.`);
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({ cropId, monthlyProductionT: values.map((v) => parseTons(v)!) });
      onSaved?.(cropId);
      onClose();
    } catch (err) {
      setError(saveErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar parâmetros de previsão"
      description="Produção mensal da cultura, em toneladas. Os meses marcados como projetados são a previsão do restante do ano."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="edit-forecast-form" loading={save.isPending} disabled={!ready}>
            Salvar parâmetros
          </Button>
        </>
      }
    >
      <form id="edit-forecast-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Cultura">
          {(id) => (
            <Select
              id={id}
              data-autofocus
              value={cropId}
              onChange={(e) => {
                setCropId(e.target.value as CropId);
                setError(null);
              }}
            >
              {EDITABLE_CROPS.map((id) => (
                <option key={id} value={id}>
                  {getCrop(id).label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {!ready ? (
          <p className="text-[13px] text-ink-muted">{forecast.isError ? 'Não foi possível carregar a previsão.' : 'Carregando valores atuais…'}</p>
        ) : (
          <div className="grid max-h-[46vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {points.map((point, i) => (
              <Field
                key={point.period}
                label={point.projected ? `${point.period} · projetado` : point.period}
                error={invalid[i] ? '0 a 100.000' : undefined}
              >
                {(id, describedBy) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid[i] || undefined}
                    inputMode="decimal"
                    value={values[i] ?? ''}
                    onChange={(e) => setValues((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                    rightSlot={<span className="text-xs text-ink-subtle">t</span>}
                  />
                )}
              </Field>
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
