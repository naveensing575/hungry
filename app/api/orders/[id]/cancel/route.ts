import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to cancel orders
    if (session.user.role === "MEMBER") {
      return NextResponse.json(
        { error: "MEMBER users cannot cancel orders" },
        { status: 403 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order belongs to user
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Cannot cancel delivered orders" },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
