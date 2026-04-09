import { NextRequest, NextResponse } from "next/server";
import {
  getBranchByIdQuery,
  updateBranchQuery,
} from "@/lib/db/queries/admin-company/branches";

type RouteContext = {
  params: Promise<{
    branchId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { branchId } = await context.params;
    const data = await getBranchByIdQuery(Number(branchId));

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
              : "No se pudo cargar la sucursal.",
        },
      },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { branchId } = await context.params;
    const body = await request.json();

    const data = await updateBranchQuery(Number(branchId), body);

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
              : "No se pudo actualizar la sucursal.",
        },
      },
      { status: 400 }
    );
  }
}