import { NextRequest, NextResponse } from "next/server";
import {
  createBranchQuery,
  listBranchesQuery,
} from "@/lib/db/queries/admin-company/branches";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const districtIdParam = searchParams.get("districtId");

    const data = await listBranchesQuery({
      search,
      status: status ?? undefined,
      districtId: districtIdParam ? Number(districtIdParam) : undefined,
    });

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
              : "No se pudieron cargar las sucursales.",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createBranchQuery(body);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "No se pudo crear la sucursal.",
        },
      },
      { status: 400 }
    );
  }
}