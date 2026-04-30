import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Composant ErrorState pour les états d'erreur
 * Design system: icône rouge + message + bouton retry
 */
export function ErrorState({
  title = "Une erreur est survenue",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center px-4",
        className
      )}
    >
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200
                     text-gray-700 rounded-xl text-sm font-medium
                     hover:bg-gray-50 hover:border-gray-300
                     active:scale-95 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      )}
    </div>
  );
}

/**
 * ErrorState inline pour les erreurs dans les composants
 */
export function ErrorInline({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl",
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200
                     text-red-700 rounded-lg text-xs font-medium
                     hover:bg-red-50 transition-all duration-200"
        >
          <RefreshCw className="w-3 h-3" />
          Réessayer
        </button>
      )}
    </div>
  );
}

export default ErrorState;
