"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Select custom avec chevron animé et style design system
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  className,
  size = "md",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev >= options.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? options.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, highlightedIndex, options, onChange]);

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-10 px-3 text-sm",
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "bg-white border border-gray-200 rounded-lg",
          "hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          "transition-all duration-150",
          sizeClasses[size]
        )}
      >
        <span className={cn(!selectedOption && "text-gray-400")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 py-1",
            "bg-white border border-gray-200 rounded-lg shadow-lg",
            "animate-in fade-in zoom-in-95 duration-100"
          )}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm",
                "hover:bg-blue-50 transition-colors",
                highlightedIndex === index && "bg-blue-50",
                option.value === value && "font-medium text-blue-600"
              )}
            >
              {option.label}
              {option.value === value && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Select simple avec options inline (pour filtres rapides)
 */
export function SelectInline({
  value,
  onChange,
  options,
  className,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 px-3 pr-8 rounded-lg border border-gray-200 text-sm",
        "bg-white appearance-none cursor-pointer",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
        "bg-[position:right_8px_center] bg-[length:16px] bg-no-repeat",
        "hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        "transition-all duration-150",
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
