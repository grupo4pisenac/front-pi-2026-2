import {
  CloudSun,
  Droplets,
  LayoutGrid,
  MapPin,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/types';

export interface NavItem {
  to: string;
  label: string;
  section: 'operacao' | 'gestao';
  icon: LucideIcon;
  permission: Permission;
  /** Mostra o ponto laranja de notificação quando há alerta ativo */
  notifyOnAlert?: boolean;
  description: string;
}

export const NAV_SECTIONS: Record<NavItem['section'], string> = {
  operacao: 'Monitoramento & Safra',
  gestao: 'Infraestrutura & Acesso',
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Painel geral',
    section: 'operacao',
    icon: LayoutGrid,
    permission: 'dashboard:read',
    description: 'Visão executiva de clima, safra e talhões',
  },
  {
    to: '/clima',
    label: 'Clima & Telemetria',
    section: 'operacao',
    icon: CloudSun,
    permission: 'climate:read',
    notifyOnAlert: true,
    description: 'Séries históricas, amplitude e estresse térmico',
  },
  {
    to: '/irrigacao',
    label: 'Irrigação & VPD',
    section: 'operacao',
    icon: Droplets,
    permission: 'irrigation:read',
    description: 'Demanda evaporativa e janelas ideais de rega',
  },
  {
    to: '/previsao',
    label: 'Safra & Talhões',
    section: 'operacao',
    icon: Sprout,
    permission: 'forecast:read',
    description: 'Projeções por cultura e ciclo fenológico dos talhões',
  },
  {
    to: '/mapeamento',
    label: 'Estações IoT',
    section: 'gestao',
    icon: MapPin,
    permission: 'sensors:read',
    description: 'Mapa da rede ESP32 em Petrolina e Juazeiro',
  },
  {
    to: '/usuarios',
    label: 'Usuários & Acessos',
    section: 'gestao',
    icon: Users,
    permission: 'users:read',
    description: 'Gestão de contas e perfis RBAC',
  },
];
