import { avatarColor } from '@/lib/avatar';
import { initials } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      // Cor vem do token avatarPalette via hash determinístico — único estilo inline do sistema
      style={{ backgroundColor: avatarColor(name) }}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-ink',
        size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-[13px]',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
