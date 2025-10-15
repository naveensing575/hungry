"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddPaymentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: cardType,
          cardLastFour: formData.get("cardLastFour"),
          cardBrand: formData.get("cardBrand"),
          isDefault: formData.get("isDefault") === "on",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        // Reset form
        (document.getElementById("payment-form") as HTMLFormElement)?.reset();
        setCardType("");
      } else {
        setError(data.error || "Failed to add payment method");
      }
    } catch (error) {
      console.error("Add payment error:", error);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="payment-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardType">Card Type</Label>
        <input type="hidden" name="type" value={cardType} />
        <Select value={cardType} onValueChange={setCardType} disabled={loading} required>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">💳 Credit Card</SelectItem>
            <SelectItem value="debit_card">💳 Debit Card</SelectItem>
            <SelectItem value="upi">📱 UPI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardBrand">Card Brand</Label>
        <Input
          id="cardBrand"
          name="cardBrand"
          type="text"
          placeholder="Visa, MasterCard, etc."
          required
          className="bg-white"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardLastFour">Last 4 Digits</Label>
        <Input
          id="cardLastFour"
          name="cardLastFour"
          type="text"
          placeholder="1234"
          maxLength={4}
          pattern="[0-9]{4}"
          required
          className="bg-white"
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          className="rounded border-gray-300"
          disabled={loading}
        />
        <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Payment Method"
        )}
      </Button>
    </form>
  );
}
