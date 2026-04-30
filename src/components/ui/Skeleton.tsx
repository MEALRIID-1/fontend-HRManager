import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Composant Skeleton pour les états de chargement
 * Design system: animate-pulse avec bg-gray-200
 */
export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  if (lines > 1) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses[variant], i === lines - 1 && "w-4/5")}
            style={{
              ...style,
              height: height || (variant === "text" ? "1rem" : undefined),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

/**
 * Skeleton pour une carte (Card)
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl p-6 space-y-4", className)}>
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton lines={3} />
    </div>
  );
}

/**
 * Skeleton pour une ligne de tableau
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            variant="text"
            width={i === 0 ? "80%" : i === columns - 1 ? "60%" : "90%"}
            height={16}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton pour une page complète
 */
export function SkeletonPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rounded" width={120} height={40} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Skeleton variant="text" width="30%" height={20} />
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Skeleton;
