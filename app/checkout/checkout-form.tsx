"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@prisma/client";
import type { Session } from "next-auth";

interface CheckoutFormProps {
  paymentMethods: PaymentMethod[];
  session: Session;
}

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

export function CheckoutForm({ paymentMethods, session }: CheckoutFormProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], restaurantId: null, restaurantName: null });
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const cartJson = localStorage.getItem("cart");
    if (cartJson) {
      const loadedCart = JSON.parse(cartJson);
      setCart(loadedCart);

      // Auto-select default payment method
      const defaultPayment = paymentMethods.find(pm => pm.isDefault);
      if (defaultPayment) {
        setSelectedPayment(defaultPayment.id);
      } else if (paymentMethods.length > 0) {
        setSelectedPayment(paymentMethods[0].id);
      }
    }
  }, [paymentMethods]);

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    if (cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          items: cart.items,
          total: total,
          paymentMethodId: selectedPayment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        setTimeout(() => {
          router.push(`/orders/${data.orderId}`);
        }, 2000);
      } else {
        alert(data.error || "Failed to create order");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Your cart is empty. Add items before checkout.</p>
          <Button
            className="mt-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
            onClick={() => router.push("/restaurants")}
          >
            Browse Restaurants
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-4">Redirecting to order details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Order Summary */}
      <div className="md:col-span-2 space-y-6">
        {/* Payment Methods */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 mb-4">No payment methods found</p>
                {session.user.role === "ADMIN" && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/payments")}
                  >
                    Add Payment Method
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {method.cardBrand} •••• {method.cardLastFour}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{method.type.replace("_", " ")}</p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {session.user.country === "INDIA" ? "₹" : "$"}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Order Total */}
      <div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Items ({itemCount})</span>
                <span>{session.user.country === "INDIA" ? "₹" : "$"}{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-orange-600">
                    {session.user.country === "INDIA" ? "₹" : "$"}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-gray-600">
                <strong>Restaurant:</strong> {cart.restaurantName}
              </p>

              <Button
                className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
                size="lg"
                onClick={handleCheckout}
                disabled={loading || !selectedPayment || paymentMethods.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
