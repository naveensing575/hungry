import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete payment methods
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only ADMIN can manage payment methods" },
        { status: 403 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Check if payment method belongs to user
    if (paymentMethod.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own payment methods" },
        { status: 403 }
      );
    }

    await prisma.paymentMethod.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
