import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getItemById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Import server action
    const { updateItem } = await import("@/actions/items");
    const result = await updateItem(id, body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
