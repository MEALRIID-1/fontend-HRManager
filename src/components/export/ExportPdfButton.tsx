"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";
import { useExportPdf } from "@/hooks/useExportPdf";

interface ExportPdfButtonProps {
  targetId: string;
  filename?: string;
  title?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ExportPdfButton({
  targetId,
  filename = "rapport-hrmanager.pdf",
  title = "Rapport HRManager",
  variant = "outline",
  size = "sm",
  className,
}: ExportPdfButtonProps) {
  const { exportToPdf } = useExportPdf();

  const handleExport = () => {
    exportToPdf(targetId, {
      filename,
      title,
      orientation: "landscape",
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={className}
      icon={<Download size={16} />}
    >
      Export PDF
    </Button>
  );
}
