"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
}

interface AddToCartButtonProps {
  menuItem: MenuItem;
}

export function AddToCartButton({ menuItem }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(0);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const addToCart = () => {
    // Get existing cart from localStorage
    const cartJson = localStorage.getItem("cart");
    const cart = cartJson ? JSON.parse(cartJson) : { items: [], restaurantId: null, restaurantName: null };

    // Check if cart has items from a different restaurant
    if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
      const confirmSwitch = confirm(
        `Your cart contains items from ${cart.restaurantName}. Do you want to clear it and add items from ${menuItem.restaurantName}?`
      );
      if (!confirmSwitch) {
        return;
      }
      // Clear cart
      cart.items = [];
    }

    // Set restaurant info
    cart.restaurantId = menuItem.restaurantId;
    cart.restaurantName = menuItem.restaurantName;

    // Check if item already exists in cart
    const existingItem = cart.items.find((item: any) => item.id === menuItem.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      });
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    setQuantity((cart.items.find((item: any) => item.id === menuItem.id)?.quantity || 0));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // Trigger a custom event to update cart count in header
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (change: number) => {
    const cartJson = localStorage.getItem("cart");
    if (!cartJson) return;

    const cart = JSON.parse(cartJson);
    const item = cart.items.find((item: any) => item.id === menuItem.id);

    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter((item: any) => item.id !== menuItem.id);
        setQuantity(0);
      } else {
        setQuantity(item.quantity);
      }

      // If cart is empty, clear restaurant info
      if (cart.items.length === 0) {
        cart.restaurantId = null;
        cart.restaurantName = null;
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  // Check initial quantity from localStorage
  useState(() => {
    const cartJson = localStorage.getItem("cart");
    if (cartJson) {
      const cart = JSON.parse(cartJson);
      const item = cart.items.find((item: any) => item.id === menuItem.id);
      if (item) {
        setQuantity(item.quantity);
      }
    }
  });

  if (quantity > 0) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-orange-300"
          onClick={() => updateQuantity(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
        <Button
          size="sm"
          className="h-8 w-8 p-0 bg-gradient-to-r from-orange-400 to-amber-500"
          onClick={() => updateQuantity(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      className={`${
        added
          ? "bg-green-500 hover:bg-green-600"
          : "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
      }`}
      onClick={addToCart}
    >
      {added ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-1" />
          Add
        </>
      )}
    </Button>
  );
}
