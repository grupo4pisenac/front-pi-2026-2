import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState } from '@/components/ui';

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ eyebrow, title, description, icon }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card>
        <EmptyState
          size="lg"
          icon={icon}
          title="Em preparação para a próxima safra"
          description={description}
        />
      </Card>
    </>
  );
}
