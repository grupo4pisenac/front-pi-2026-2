import { avatarPalette } from '@/theme/tokens';

/** Hash djb2 — estável entre sessões, então cada pessoa mantém sempre a mesma cor. */
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function avatarColor(name: string): string {
  return avatarPalette[hash(name) % avatarPalette.length] ?? avatarPalette[0];
}
