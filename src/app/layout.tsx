import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — RH Manager",
    default: "RH Manager · Système de Gestion RH",
  },
  description: "Plateforme de gestion des ressources humaines : employés, congés, contrats et rapports.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
