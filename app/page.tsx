import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, LogOut, User, MapPin } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hungry</h1>
                <p className="text-xs text-gray-600">Food Ordering Platform</p>
              </div>
            </div>
            <form action={async () => {
              "use server";
              const { signOut } = await import("@/lib/auth");
              await signOut({ redirectTo: "/login" });
            }}>
              <Button
                type="submit"
                variant="outline"
                className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">
                Welcome back, {session.user.name}! 👋
              </CardTitle>
              <CardDescription className="text-gray-600">
                You're logged in as <span className="font-semibold text-orange-600">{session.user.role}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{session.user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{session.user.country}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Your Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-800">
                <li>✓ View restaurants & menus</li>
                <li>✓ Create orders</li>
                {(session.user.role === "ADMIN" || session.user.role === "MANAGER") && (
                  <>
                    <li>✓ Checkout & pay</li>
                    <li>✓ Cancel orders</li>
                  </>
                )}
                {session.user.role === "ADMIN" && (
                  <li>✓ Manage payment methods</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Available Restaurants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                You can see restaurants from <span className="font-semibold">{session.user.country}</span> region
              </p>
              <Link href="/restaurants">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Browse Restaurants
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/orders">
                <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-100">
                  View Orders
                </Button>
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/payments">
                  <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-100">
                    Manage Payments
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              This is a role-based food ordering application with country-based restaurant filtering.
              Your experience will vary based on your role:
            </p>
            <ul className="text-gray-700 space-y-1 mt-3">
              <li><strong>ADMIN:</strong> Full access - manage payments, create/cancel orders, checkout</li>
              <li><strong>MANAGER:</strong> Can create orders, checkout and cancel them</li>
              <li><strong>MEMBER:</strong> Can only view restaurants and create orders (no checkout)</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Restaurants are filtered by country - you'll only see options from <strong>{session.user.country}</strong>.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
