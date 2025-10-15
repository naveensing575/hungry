import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can add payment methods
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only ADMIN can manage payment methods" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, cardLastFour, cardBrand, isDefault } = body;

    if (!type || !cardLastFour || !cardBrand) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        cardLastFour,
        cardBrand,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      paymentMethod,
    });
  } catch (error) {
    console.error("Payment method creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    );
  }
}
