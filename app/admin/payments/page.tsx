import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddPaymentForm } from "./add-payment-form";
import { DeletePaymentButton } from "./delete-payment-button";

export default async function AdminPaymentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMIN can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      isDefault: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Payment Methods</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Payment Method */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Add Payment Method</CardTitle>
              <CardDescription>Add a new card for payments</CardDescription>
            </CardHeader>
            <CardContent>
              <AddPaymentForm userId={session.user.id} />
            </CardContent>
          </Card>

          {/* Existing Payment Methods */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Your Cards</CardTitle>
              <CardDescription>
                {paymentMethods.length} payment method{paymentMethods.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-600">No payment methods added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {method.cardBrand} •••• {method.cardLastFour}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {method.type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <DeletePaymentButton paymentMethodId={method.id} />
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
