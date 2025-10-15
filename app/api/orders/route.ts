import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to checkout
    if (session.user.role === "MEMBER") {
      return NextResponse.json(
        { error: "MEMBER users cannot checkout" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { restaurantId, items, total, paymentMethodId } = body;

    if (!restaurantId || !items || items.length === 0 || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify payment method belongs to user
    if (paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (!paymentMethod || paymentMethod.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
      }
    }

    // Create order with order items in a transaction
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: total,
        status: "CONFIRMED",
        orderItems: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's orders
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
