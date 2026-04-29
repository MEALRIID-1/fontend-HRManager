"use client";

import { useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface ExportOptions {
  filename?: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  quality?: number;
}

export function useExportPdf() {
  const exportToPdf = useCallback(async (
    elementId: string,
    options: ExportOptions = {}
  ) => {
    const {
      filename = "rapport.pdf",
      title = "Rapport HRManager",
      orientation = "landscape",
      quality = 2,
    } = options;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Élément non trouvé pour l'export");
        return;
      }

      toast.loading("Génération du PDF en cours...");

      // Créer le canvas à partir de l'élément
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Dimensions du PDF
      const pdfWidth = orientation === "landscape" ? 297 : 210;
      const pdfHeight = orientation === "landscape" ? 210 : 297;

      // Créer le PDF
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });

      // Ajouter le titre
      pdf.setFontSize(16);
      pdf.text(title, 15, 15);

      // Ajouter la date
      pdf.setFontSize(10);
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 15, 22);

      // Calculer les dimensions de l'image
      const imgWidth = pdfWidth - 30; // Marges de 15mm de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ajouter l'image au PDF
      pdf.addImage(imgData, "PNG", 15, 30, imgWidth, imgHeight);

      // Sauvegarder le PDF
      pdf.save(filename);

      toast.dismiss();
      toast.success("PDF exporté avec succès");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.dismiss();
      toast.error("Erreur lors de l'export PDF");
    }
  }, []);

  return { exportToPdf };
}
