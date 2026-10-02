import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        size="lg"
        icon={Compass}
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi movido."
        action={
          <Link to="/" className="inline-flex h-9 items-center rounded-tile bg-brand px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover">
            Ir para o painel
          </Link>
        }
      />
    </Card>
  );
}
