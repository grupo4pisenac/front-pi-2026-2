export type Role = 'ADMIN' | 'ANALISTA_DADOS' | 'PRODUTOR_EXPORTADOR';

export type Permission =
  | 'dashboard:read'
  | 'forecast:read'
  | 'climate:read'
  | 'irrigation:read'
  | 'reports:read'
  | 'analytics:read'
  | 'sensors:read'
  | 'sensors:write'
  | 'users:read'
  | 'users:write';
