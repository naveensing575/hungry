import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, MapPin, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";

export default async function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch restaurant with menu items
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: params.id,
    },
    include: {
      menuItems: {
        orderBy: {
          category: "asc",
        },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  // Check if user has access to this restaurant (country filtering)
  if (restaurant.country !== session.user.country) {
    redirect("/restaurants");
  }

  // Group menu items by category
  const menuByCategory = restaurant.menuItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof restaurant.menuItems>);

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
                <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
                <p className="text-xs text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {restaurant.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/cart">
                <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </Button>
              </Link>
              <Link href="/restaurants">
                <Button variant="outline" className="border-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Restaurant Image */}
              <div className="md:w-1/3 relative h-64 md:h-auto">
                {restaurant.imageUrl ? (
                  <Image
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                    <UtensilsCrossed className="w-24 h-24 text-orange-400" />
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="md:w-2/3 p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">{restaurant.name}</h2>
                <p className="text-gray-600 mb-4">
                  {restaurant.description || "Delicious food made with love!"}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {restaurant.country}
                  </span>
                  <span>•</span>
                  <span>{restaurant.menuItems.length} menu items</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Menu Items by Category */}
        {restaurant.menuItems.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Menu Items</h3>
              <p className="text-gray-500">This restaurant hasn't added any menu items yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow">
                      {item.imageUrl && (
                        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-800">{item.name}</CardTitle>
                        {item.description && (
                          <CardDescription className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-orange-600">
                            {restaurant.country === "INDIA" ? "₹" : "$"}
                            {item.price.toFixed(2)}
                          </span>
                          <AddToCartButton
                            menuItem={{
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              restaurantId: restaurant.id,
                              restaurantName: restaurant.name,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
