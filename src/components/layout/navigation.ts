import {
  BarChart3,
  CloudSun,
  Droplets,
  FileText,
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
  icon: LucideIcon;
  permission: Permission;
  /** Mostra o ponto laranja de notificação quando há alerta ativo */
  notifyOnAlert?: boolean;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Painel', icon: LayoutGrid, permission: 'dashboard:read', description: 'Visão geral da operação' },
  { to: '/previsao', label: 'Previsão de safra', icon: Sprout, permission: 'forecast:read', description: 'Projeções por cultura e talhão' },
  { to: '/clima', label: 'Clima', icon: CloudSun, permission: 'climate:read', notifyOnAlert: true, description: 'Leituras e alertas meteorológicos' },
  { to: '/irrigacao', label: 'Irrigação', icon: Droplets, permission: 'irrigation:read', description: 'Lâminas e turnos de rega' },
  { to: '/relatorios', label: 'Relatórios', icon: FileText, permission: 'reports:read', description: 'Relatórios para exportação' },
  { to: '/analises', label: 'Análises', icon: BarChart3, permission: 'analytics:read', description: 'Cruzamentos e séries históricas' },
  { to: '/mapeamento', label: 'Mapeamento', icon: MapPin, permission: 'sensors:read', description: 'Estações IoT em campo' },
  { to: '/usuarios', label: 'Usuários', icon: Users, permission: 'users:read', description: 'Acessos e perfis' },
];
