"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], restaurantId: null, restaurantName: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const loadCart = () => {
    const cartJson = localStorage.getItem("cart");
    if (cartJson) {
      setCart(JSON.parse(cartJson));
    }
    setLoading(false);
  };

  const updateQuantity = (itemId: string, change: number) => {
    const updatedCart = { ...cart };
    const item = updatedCart.items.find((item) => item.id === itemId);

    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        updatedCart.items = updatedCart.items.filter((item) => item.id !== itemId);
      }
    }

    if (updatedCart.items.length === 0) {
      updatedCart.restaurantId = null;
      updatedCart.restaurantName = null;
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      localStorage.removeItem("cart");
      setCart({ items: [], restaurantId: null, restaurantName: null });
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const canCheckout = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
                <p className="text-xs text-gray-600">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Link href="/restaurants">
              <Button variant="outline" className="border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.items.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
              <Link href="/restaurants">
                <Button className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Browse Restaurants
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Restaurant Info */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Order from {cart.restaurantName}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Cart Items */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800">Items</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Cart
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {session?.user.country === "INDIA" ? "₹" : "$"}
                          {item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-orange-300"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-gradient-to-r from-orange-400 to-amber-500"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-bold text-gray-800 w-24 text-right">
                          {session?.user.country === "INDIA" ? "₹" : "$"}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
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
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">
                      {session?.user.country === "INDIA" ? "₹" : "$"}
                      {total.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-orange-600">
                        {session?.user.country === "INDIA" ? "₹" : "$"}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {canCheckout ? (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
                      size="lg"
                      onClick={() => router.push("/checkout")}
                    >
                      Proceed to Checkout
                    </Button>
                  ) : (
                    <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Only ADMIN and MANAGER roles can proceed to checkout. MEMBER users can only add items to cart.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
