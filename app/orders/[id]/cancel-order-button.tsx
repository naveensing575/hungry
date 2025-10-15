"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Order cancelled successfully");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred while cancelling the order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <X className="mr-2 h-4 w-4" />
          Cancel Order
        </>
      )}
    </Button>
  );
}
