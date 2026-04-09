import { NextResponse } from "next/server";
import { getDashboardQuery } from "@/lib/db/queries/admin-company/dashboard";

export async function GET() {
  try {
    const data = await getDashboardQuery();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "No se pudo cargar el dashboard.",
        },
      },
      { status: 500 }
    );
  }
}