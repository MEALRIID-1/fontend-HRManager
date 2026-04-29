// Types pour les réponses API - Centralisés pour éviter les erreurs de typage

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    totalPages?: number;
  };
}

// Type helper pour extraire les données paginées
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
