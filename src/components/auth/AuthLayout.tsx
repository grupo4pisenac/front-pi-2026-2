import type { ReactNode } from 'react';
import { RadioTower } from 'lucide-react';
import { ThemeToggle } from '@/app/theme';
import { Logo } from '@/components/layout/Logo';
import { Card } from '@/components/ui';

/**
 * Moldura das telas públicas de autenticação (login e recuperação de senha):
 * painel visual à esquerda e o conteúdo do formulário à direita.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-canvas px-4 py-10">
      <div className=" fixed right-5 top-5 z-20">
        <ThemeToggle showLabel />
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-card border border-border bg-surface shadow-pop lg:grid-cols-12">
        {/* Painel visual lateral */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0D2618] p-8 text-white lg:col-span-6 lg:flex">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#081A10] via-[#0D2618]/85 to-[#123522]/70" />

          <div className="relative z-10">
            <Logo variant="dark" />
          </div>

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur-sm">
              <RadioTower className="h-3.5 w-3.5 text-emerald-400" />
              Telemetria IoT · ThingSpeak + ESP32
            </span>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight">
              Inteligência climática para fruticultura irrigada de exportação.
            </h2>
            <p className="text-xs leading-relaxed text-emerald-100/75">
              Acompanhe temperatura, umidade do ar, demanda evaporativa (VPD) e previsão de safra em tempo real nas
              estações de Petrolina e Juazeiro.
            </p>
          </div>
        </div>

        {/* Conteúdo (formulário) */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <Card className="border-0 shadow-none">{children}</Card>
        </div>
      </div>
    </div>
  );
}
