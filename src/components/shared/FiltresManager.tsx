"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Filter, Users } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

interface FiltresManagerProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, { value: string; label: string; options: { value: string; label: string }[] }>;
  onFilterChange: (key: string, value: string) => void;
  totalResults: number;
  totalItems: number;
  className?: string;
}

/**
 * Composant de filtres amélioré pour le Manager
 * Design system: search animé, select custom, badges filtres actifs
 */
export function FiltresManager({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  totalResults,
  totalItems,
  className,
}: FiltresManagerProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Déterminer les filtres actifs
  const activeFilters = Object.entries(filters).filter(([_, filter]) => filter.value !== "all");

  // Réinitialiser un filtre
  const clearFilter = useCallback(
    (key: string) => {
      onFilterChange(key, "all");
    },
    [onFilterChange]
  );

  // Réinitialiser tous les filtres
  const clearAllFilters = useCallback(() => {
    Object.keys(filters).forEach((key) => onFilterChange(key, "all"));
    onSearchChange("");
  }, [filters, onFilterChange, onSearchChange]);

  const hasActiveFilters = activeFilters.length > 0 || searchQuery;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Ligne 1: Search + Selects */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search avec loupe animée */}
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200",
              isSearchFocused ? "text-blue-500 scale-110" : "text-gray-400"
            )}
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom, email, matricule..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "w-full h-10 pl-10 pr-10 rounded-lg border text-sm",
              "placeholder:text-gray-400",
              "transition-all duration-200",
              isSearchFocused
                ? "border-blue-400 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-gray-300"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Selects custom */}
        <div className="flex items-center gap-2">
          {Object.entries(filters).map(([key, filter]) => (
            <Select
              key={key}
              value={filter.value}
              onChange={(value) => onFilterChange(key, value)}
              options={filter.options}
              placeholder={filter.label}
              className="min-w-[150px]"
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Ligne 2: Badges filtres actifs + Compteur */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Badges des filtres actifs */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters ? (
            <>
              <div className="flex items-center gap-1 text-sm text-gray-500 mr-2">
                <Filter size={14} />
                <span>Filtres actifs:</span>
              </div>

              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    "bg-blue-100 text-blue-700 text-xs font-medium",
                    "hover:bg-blue-200 transition-colors group"
                  )}
                >
                  <Search size={12} />
                  <span>"{searchQuery.slice(0, 20)}{searchQuery.length > 20 ? "..." : ""}"</span>
                  <X
                    size={12}
                    className="ml-1 text-blue-500 group-hover:text-blue-700 transition-colors"
                  />
                </button>
              )}

              {activeFilters.map(([key, filter]) => {
                const selectedOption = filter.options.find((o) => o.value === filter.value);
                if (!selectedOption) return null;

                return (
                  <button
                    key={key}
                    onClick={() => clearFilter(key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                      "bg-blue-100 text-blue-700 text-xs font-medium",
                      "hover:bg-blue-200 transition-colors group"
                    )}
                  >
                    <span>{selectedOption.label}</span>
                    <X
                      size={12}
                      className="text-blue-500 group-hover:text-blue-700 transition-colors"
                    />
                  </button>
                );
              })}

              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-2"
              >
                Tout effacer
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={14} />
              <span>Tous les employés affichés</span>
            </div>
          )}
        </div>

        {/* Compteur de résultats */}
        <div className="text-sm">
          {totalResults === totalItems ? (
            <span className="text-gray-500">
              <span className="font-semibold text-gray-700">{totalItems}</span> employé
              {totalItems > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-gray-500">
              <span className="font-semibold text-gray-700">{totalResults}</span> résultat
              {totalResults > 1 ? "s" : ""} sur{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default FiltresManager;
