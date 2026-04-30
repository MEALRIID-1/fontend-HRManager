/**
 * Centralisation des routes API pour vérification de cohérence
 * entre le frontend et le backend Laravel
 */

export const API_ROUTES = {
  // ── AUTH ───────────────────────────────────────────────────────────────
  LOGIN:               '/api/login',
  LOGOUT:              '/api/logout',
  ME:                  '/api/me',
  ME_PHOTO:            '/api/me/photo',
  ME_PASSWORD:         '/api/me/password',

  // ── COMMUN ──────────────────────────────────────────────────────────────
  DEPARTEMENTS:        '/api/departements',
  NOTIFICATIONS:       '/api/notifications',
  NOTIF_LIRE:          (id: number) => `/api/notifications/${id}/lire`,
  NOTIF_LIRE_TOUT:     '/api/notifications/lire-tout',

  // ── EMPLOYÉ ────────────────────────────────────────────────────────────
  ME_CONGES:           '/api/me/conges',
  ME_CONGES_SOLDE:     '/api/me/conges/solde',
  ME_CONTRAT_ACTIF:    '/api/me/contrats/actif',
  ME_CONTRATS:         '/api/me/contrats',

  // ── RH ─────────────────────────────────────────────────────────────────
  RH_DASHBOARD:        '/api/rh/dashboard',
  RH_EMPLOYES:         '/api/rh/employes',
  RH_EMPLOYE:          (id: number) => `/api/rh/employes/${id}`,
  RH_EMPLOYES_CORB:    '/api/rh/employes/corbeille',
  RH_EMPLOYE_REST:     (id: number) => `/api/rh/employes/${id}/restaurer`,
  RH_CONTRATS:         '/api/rh/contrats',
  RH_CONTRAT:          (id: number) => `/api/rh/contrats/${id}`,
  RH_CONTRATS_CORB:    '/api/rh/contrats/corbeille',
  RH_CONTRAT_REST:     (id: number) => `/api/rh/contrats/${id}/restaurer`,
  RH_CONGES:           '/api/rh/conges',
  RH_CONGE:            (id: number) => `/api/rh/conges/${id}`,
  RH_CONGE_APPROUVER:  (id: number) => `/api/rh/conges/${id}/approuver`,
  RH_CONGES_CORB:      '/api/rh/conges/corbeille',
  RH_CONGE_REST:       (id: number) => `/api/rh/conges/${id}/restaurer`,
  RH_FICHES_PAIE:      '/api/rh/fiches-paie',
  RH_RAPPORTS:         '/api/rh/rapports',

  // ── MANAGER ───────────────────────────────────────────────────────────
  MGR_DASHBOARD:       '/api/manager/dashboard',
  MGR_EQUIPE:          '/api/manager/equipe',
  MGR_MEMBRE:          (id: number) => `/api/manager/equipe/${id}`,
  MGR_EQUIPE_CORB:     '/api/manager/equipe/corbeille',
  MGR_MEMBRE_REST:     (id: number) => `/api/manager/equipe/${id}/restaurer`,
  MGR_CONGES:          '/api/manager/conges',
  MGR_CONGE_APPROUVER: (id: number) => `/api/manager/conges/${id}/approuver`,
  MGR_CONGES_CORB:     '/api/manager/conges/corbeille',
  MGR_CONGE_REST:      (id: number) => `/api/manager/conges/${id}/restaurer`,
  MGR_CONTRATS:        '/api/manager/contrats',
  MGR_CONTRAT:         (id: number) => `/api/manager/contrats/${id}`,

  // ── ADMIN / DIRECTEUR ──────────────────────────────────────────────────
  ADMIN_DASHBOARD:     '/api/admin/dashboard',
  ADMIN_GRAPHIQUES:    '/api/admin/dashboard/graphiques',
  ADMIN_STATS:         '/api/admin/dashboard/stats',
  DIR_CONGES:          '/api/directeur/conges',
  DIR_CONGE_APPROUVER: (id: number) => `/api/directeur/conges/${id}/approuver`,
  DIR_CONGES_CORB:     '/api/directeur/conges/corbeille',
  DIR_RAPPORTS:        (type: string) => `/api/directeur/rapports/${type}`,
  DIR_NOTIFICATIONS:   '/api/directeur/notifications',

  // ── REPORTS ────────────────────────────────────────────────────────────
  REPORTS_DASHBOARD:   '/api/reports/dashboard',
  REPORTS_CHARTS:      '/api/reports/charts',
  REPORTS_LEAVES:      '/api/reports/leaves',
  REPORTS_EMPLOYEES:   '/api/reports/employees',
  REPORTS_EXPORT:      (type: string) => `/api/reports/${type}/export`,

  // ── ROLES & PERMISSIONS ────────────────────────────────────────────────
  ROLES:               '/api/roles',
  ROLE:                (id: number) => `/api/roles/${id}`,
  PERMISSIONS:         '/api/permissions',
  PERMISSIONS_BY_MODULE: '/api/permissions/by-module',
  AUDIT_LOGS:          '/api/audit/logs',

  // ── FILES ─────────────────────────────────────────────────────────────
  FILES_UPLOAD:        '/api/files/upload',
  FILES_PHOTO:         (userId: string) => `/api/files/photo/${userId}`,
} as const;

/**
 * Vérification que l'URL utilisée correspond bien à une route définie
 */
export function validateApiRoute(url: string): boolean {
  const allRoutes = Object.values(API_ROUTES).flatMap((v) =>
    typeof v === 'function' ? [] : [v]
  );
  return allRoutes.some((route) => url.includes(route));
}

/**
 * Construction d'une URL API complète
 */
export function buildApiUrl(route: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${route}`;
}
