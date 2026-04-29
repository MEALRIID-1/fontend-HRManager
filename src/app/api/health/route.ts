import { NextResponse } from "next/server";

/**
 * Healthcheck simple pour le frontend Next.js.
 * Utilisé par Docker pour vérifier que l'application répond correctement.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Frontend healthy",
      data: { status: "ok" },
    },
    { status: 200 }
  );
}