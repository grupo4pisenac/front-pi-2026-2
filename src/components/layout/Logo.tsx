import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-tile bg-brand text-white">
        <Sprout className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="leading-tight">
        <p className="text-[17px] font-bold tracking-tight text-ink">
          bartô<span className="text-brand">.io</span>
        </p>
        <p className="text-[11px] font-medium text-ink-subtle">Clima &amp; safra · Vale do São Francisco</p>
      </div>
    </div>
  );
}
