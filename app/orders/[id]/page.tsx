import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { CancelOrderButton } from "./cancel-order-button";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
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
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Check if order belongs to user
  if (order.userId !== session.user.id) {
    redirect("/orders");
  }

  const restaurant = order.orderItems[0]?.menuItem.restaurant;
  const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const canCancel = (session.user.role === "ADMIN" || session.user.role === "MANAGER") &&
                    order.status !== "CANCELLED" &&
                    order.status !== "DELIVERED";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PREPARING":
        return "bg-yellow-100 text-yellow-700";
      case "READY":
        return "bg-green-100 text-green-700";
      case "DELIVERED":
        return "bg-green-200 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                <p className="text-xs text-gray-600">#{order.id.slice(0, 8)}</p>
              </div>
            </div>
            <Link href="/orders">
              <Button variant="outline" className="border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Order Status */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gray-800 mb-2">Order Status</CardTitle>
                  <span className={`inline-block text-sm px-3 py-1 rounded font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                {canCancel && <CancelOrderButton orderId={order.id} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Placed</p>
                  <p className="text-gray-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Restaurant</p>
                  <p className="text-gray-800 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {restaurant?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Order Items</CardTitle>
              <CardDescription>{itemCount} item{itemCount !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.menuItem.name}</p>
                      <p className="text-sm text-gray-600">
                        {session.user.country === "INDIA" ? "₹" : "$"}
                        {item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      {session.user.country === "INDIA" ? "₹" : "$"}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>
                    {session.user.country === "INDIA" ? "₹" : "$"}
                    {order.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total Paid</span>
                    <span className="text-orange-600">
                      {session.user.country === "INDIA" ? "₹" : "$"}
                      {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
