"use client";

import { useState } from "react";
import { Trash2, ArrowLeft, RefreshCw, Archive, AlertCircle } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface TrashViewProps<T> {
  /** Label de l'entité (ex: "Employé", "Contrat", "Congé") */
  entityLabel: string;
  /** Label pluriel (ex: "Employés", "Contrats") */
  entityLabelPlural: string;
  /** Colonnes du tableau */
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
  /** Fonction pour charger les éléments archivés */
  fetchArchives: () => Promise<T[]>;
  /** Fonction pour restaurer un élément */
  restoreItem: (id: string) => Promise<void>;
  /** Callback après restauration réussie */
  onRestoreSuccess?: () => void;
  /** Callback pour fermer la vue corbeille */
  onClose: () => void;
  /** Clé pour l'ID de l'élément */
  idKey?: keyof T;
  /** Clé pour la date d'archivage */
  deletedAtKey?: keyof T;
}

/**
 * Composant réutilisable pour la vue Corbeille (Archives)
 * Affiche les éléments soft-deletés avec possibilité de restauration
 */
export function TrashView<T extends Record<string, any>>({
  entityLabel,
  entityLabelPlural,
  columns,
  fetchArchives,
  restoreItem,
  onRestoreSuccess,
  onClose,
  idKey = "id" as keyof T,
  deletedAtKey = "deletedAt" as keyof T,
}: TrashViewProps<T>) {
  const [archives, setArchives] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Charger les archives au montage
  useState(() => {
    loadArchives();
  });

  const loadArchives = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const data = await fetchArchives();
      setArchives(data);
    } catch (error) {
      console.error("Erreur chargement archives:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item: T) => {
    const id = String(item[idKey]);
    try {
      setRestoringId(id);
      await restoreItem(id);
      
      // Optimistic update
      setArchives((prev) => prev.filter((a) => a[idKey] !== id));
      toast.success(`${entityLabel} restauré avec succès`);
      
      onRestoreSuccess?.();
    } catch (error) {
      console.error("Erreur restauration:", error);
      toast.error(`Échec de la restauration`);
    } finally {
      setRestoringId(null);
    }
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto text-danger mb-3" size={40} />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-slate-500 mb-4">
          Impossible de charger les {entityLabelPlural.toLowerCase()} archivés
        </p>
        <div className="flex justify-center gap-2">
          <Button onClick={loadArchives} icon={<RefreshCw size={16} />}>
            Réessayer
          </Button>
          <Button variant="outline" onClick={onClose} icon={<ArrowLeft size={16} />}>
            Retour
          </Button>
        </div>
      </Card>
    );
  }

  // Empty state
  if (archives.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Archive className="text-slate-500" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Archives — {entityLabelPlural}
              </h2>
              <p className="text-sm text-slate-500">
                Éléments supprimés temporairement
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} icon={<ArrowLeft size={16} />}>
            Retour à la liste
          </Button>
        </div>

        <div className="py-12">
          <Trash2 className="mx-auto text-slate-200 mb-4" size={64} />
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            Aucun {entityLabel.toLowerCase()} archivé
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            La corbeille est vide. Les éléments supprimés apparaîtront ici.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Archive className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Archives — {entityLabelPlural}
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              {archives.length} {archives.length > 1 ? entityLabelPlural.toLowerCase() : entityLabel.toLowerCase()} archivé{archives.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} icon={<ArrowLeft size={16} />}>
          Retour à la liste
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Archivé le
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {archives.map((item, index) => (
              <tr
                key={String(item[idKey])}
                className={cn(
                  "hover:bg-slate-50/50 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <Badge variant="gray" size="sm">
                    {item[deletedAtKey] 
                      ? new Date(item[deletedAtKey]).toLocaleDateString("fr-FR")
                      : "N/A"
                    }
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw size={14} />}
                    loading={restoringId === String(item[idKey])}
                    onClick={() => handleRestore(item)}
                  >
                    Restaurer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
