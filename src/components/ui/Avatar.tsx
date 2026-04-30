import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
  online?: boolean;
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

/**
 * Composant Avatar avec fallback sur initiales ou icône
 * Design system: tailles cohérentes, indicateur en ligne optionnel
 */
export function Avatar({
  src,
  alt = "",
  size = "md",
  fallback,
  className,
  online,
}: AvatarProps) {
  // Fallback: initiales ou première lettre
  const getInitials = () => {
    if (!fallback) return null;
    const parts = fallback.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fallback[0]?.toUpperCase() || "?";
  };

  const initials = getInitials();

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center",
          "ring-2 ring-white shadow-sm",
          sizes[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : initials ? (
          <span className="font-semibold text-gray-600 select-none">
            {initials}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>

      {/* Indicateur en ligne */}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
            online ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}

/**
 * Avatar avec badge de rôle
 */
export function AvatarWithRole({
  src,
  alt,
  size = "md",
  fallback,
  role,
  className,
}: AvatarProps & { role?: string }) {
  const roleColors: Record<string, string> = {
    admin: "bg-purple-500",
    directeur: "bg-blue-600",
    rh: "bg-emerald-500",
    manager: "bg-amber-500",
    employe: "bg-gray-500",
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <Avatar src={src} alt={alt} size={size} fallback={fallback} />
      {role && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white uppercase tracking-wider shadow-sm",
            roleColors[role.toLowerCase()] || "bg-gray-500"
          )}
        >
          {role}
        </span>
      )}
    </div>
  );
}

export default Avatar;
