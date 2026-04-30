import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Composant Pagination réutilisable
 * Design system: boutons avec hover et état actif bleu
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (itemsPerPage || 10) + 1;
  const endItem = Math.min(startItem + (itemsPerPage || 10) - 1, totalItems || 0);

  // Générer les pages à afficher
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      {/* Info */}
      <div className="text-sm text-gray-500">
        {totalItems ? (
          <span>
            Affichage de <span className="font-medium text-gray-700">{startItem}</span> à{" "}
            <span className="font-medium text-gray-700">{endItem}</span> sur{" "}
            <span className="font-medium text-gray-700">{totalItems}</span> résultats
          </span>
        ) : (
          <span>
            Page <span className="font-medium text-gray-700">{currentPage}</span> sur{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={cn(
              "min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium",
              "active:scale-95 transition-all duration-200",
              page === currentPage
                ? "bg-blue-600 text-white shadow-sm"
                : page === "..."
                ? "text-gray-400 cursor-default"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Pagination simplifiée pour les petites listes
 */
export function PaginationSimple({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: Omit<PaginationProps, "totalItems" | "itemsPerPage">) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
      >
        Précédent
      </button>
      <span className="text-sm text-gray-500 px-2">
        Page {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
      >
        Suivant
      </button>
    </div>
  );
}

export default Pagination;
