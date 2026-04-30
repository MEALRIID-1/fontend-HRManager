import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Composant EmptyState pour les états de liste vide
 * Design system: illustration + titre + description + bouton action
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center px-4",
        className
      )}
    >
      {icon || (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <svg
            className="w-8 h-8 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-5">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                     hover:bg-blue-700 active:scale-95 transition-all duration-200
                     shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * EmptyState spécifique pour les recherches sans résultats
 */
export function EmptySearch({ onClear, searchTerm }: { onClear: () => void; searchTerm?: string }) {
  return (
    <EmptyState
      title={searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucun résultat"}
      description="Essayez avec d'autres termes ou filtres"
      action={{ label: "Réinitialiser la recherche", onClick: onClear }}
      icon={
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      }
    />
  );
}

export default EmptyState;
