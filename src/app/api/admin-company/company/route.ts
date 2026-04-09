import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyProfileQuery,
  updateCompanyProfileQuery,
} from "@/lib/db/queries/admin-company/company";

export async function GET() {
  try {
    const data = await getCompanyProfileQuery();

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
              : "No se pudo cargar el perfil del negocio.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await updateCompanyProfileQuery(body);

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
              : "No se pudo actualizar el perfil del negocio.",
        },
      },
      { status: 400 }
    );
  }
}