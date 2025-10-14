import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function RestaurantsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch restaurants filtered by user's country
  const restaurants = await prisma.restaurant.findMany({
    where: {
      country: session.user.country as "INDIA" | "AMERICA",
    },
    include: {
      menuItems: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      name: "asc",
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
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hungry</h1>
                <p className="text-xs text-gray-600">Restaurants in {session.user.country}</p>
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
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Restaurants</h2>
          <p className="text-gray-600">
            Showing {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} available in{" "}
            <span className="font-semibold text-orange-600">{session.user.country}</span>
          </p>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Restaurants Found</h3>
              <p className="text-gray-500">
                There are no restaurants available in {session.user.country} at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  {/* Restaurant Image */}
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                        <UtensilsCrossed className="w-16 h-16 text-orange-400" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">{restaurant.name}</CardTitle>
                    <CardDescription className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {restaurant.country}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description || "Delicious food awaits you!"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {restaurant.menuItems.length} items
                      </span>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
                      >
                        View Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
