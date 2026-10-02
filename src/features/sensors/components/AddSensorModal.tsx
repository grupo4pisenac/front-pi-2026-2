import { useState, type FormEvent } from 'react';
import type { CropId, Municipality, StationInput } from '@/types';
import { CROPS, CROP_IDS } from '@/lib/crops';
import { Button, Field, Input, Modal, Select } from '@/components/ui';

interface AddSensorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: StationInput) => void;
  isSubmitting: boolean;
  error: string | null;
}

const EMPTY: StationInput = { id: '', name: '', municipality: 'PETROLINA', productId: 'UVA_SUGRAONE', thingSpeakChannelId: '' };

type Errors = Partial<Record<keyof StationInput, string>>;

function validate(v: StationInput): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 3) e.name = 'Informe um nome com pelo menos 3 caracteres.';
  if (!/^ESP-[A-Z]{3}-\d{2}$/.test(v.id.trim())) e.id = 'Formato esperado: ESP-PTR-04';
  if (!/^\d{5,8}$/.test(v.thingSpeakChannelId.trim())) e.thingSpeakChannelId = 'ID numérico do canal (5 a 8 dígitos).';
  return e;
}

export function AddSensorModal({ open, onClose, onSubmit, isSubmitting, error }: AddSensorModalProps) {
  const [values, setValues] = useState<StationInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof StationInput>(k: K, v: StationInput[K]) => setValues((prev) => ({ ...prev, [k]: v }));

  const handleClose = () => {
    setValues(EMPTY);
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit({ ...values, id: values.id.trim().toUpperCase(), name: values.name.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar sensor"
      description="Cadastre uma estação ESP32 já publicando em um canal do ThingSpeak."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" form="add-sensor-form" loading={isSubmitting}>
            Adicionar sensor
          </Button>
        </>
      }
    >
      <form id="add-sensor-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Nome da estação" error={errors.name}>
          {(id, d) => (
            <Input id={id} aria-describedby={d} aria-invalid={!!errors.name} data-autofocus value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Fazenda Santa Clara" />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ID do dispositivo" error={errors.id}>
            {(id, d) => (
              <Input id={id} aria-describedby={d} aria-invalid={!!errors.id} value={values.id} onChange={(e) => set('id', e.target.value.toUpperCase())} placeholder="ESP-PTR-04" />
            )}
          </Field>
          <Field label="Canal ThingSpeak" error={errors.thingSpeakChannelId}>
            {(id, d) => (
              <Input id={id} aria-describedby={d} aria-invalid={!!errors.thingSpeakChannelId} inputMode="numeric" value={values.thingSpeakChannelId} onChange={(e) => set('thingSpeakChannelId', e.target.value)} placeholder="2481040" />
            )}
          </Field>
          <Field label="Município">
            {(id) => (
              <Select id={id} value={values.municipality} onChange={(e) => set('municipality', e.target.value as Municipality)}>
                <option value="PETROLINA">Petrolina · PE</option>
                <option value="JUAZEIRO">Juazeiro · BA</option>
              </Select>
            )}
          </Field>
          <Field label="Produto associado">
            {(id) => (
              <Select id={id} value={values.productId} onChange={(e) => set('productId', e.target.value as CropId)}>
                {CROP_IDS.map((c) => (
                  <option key={c} value={c}>
                    {CROPS[c].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        {error && (
          <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
