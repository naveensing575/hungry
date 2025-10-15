import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft, Package, Clock } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
                <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                <p className="text-xs text-gray-600">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">Start ordering delicious food from your favorite restaurants!</p>
              <Link href="/restaurants">
                <Button className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Browse Restaurants
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const restaurant = order.orderItems[0]?.menuItem.restaurant;
              const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg text-gray-800">
                              {restaurant?.name || "Unknown Restaurant"}
                            </CardTitle>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <CardDescription className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()} at{" "}
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>•</span>
                            <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">
                            {session.user.country === "INDIA" ? "₹" : "$"}
                            {order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        ))}
                        {order.orderItems.length > 3 && (
                          <span className="text-sm text-gray-500 px-3 py-1">
                            +{order.orderItems.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
