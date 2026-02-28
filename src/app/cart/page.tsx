
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

const initialCart = [
  { id: 1, name: "Truffle Tagliatelle", price: 28, quantity: 2, image: "food-pasta" },
  { id: 5, name: "Hibiscus Gin", price: 16, quantity: 1, image: "food-cocktail" },
];

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsOrdered(true);
      toast({
        title: "Order Placed!",
        description: "Your food is being prepared. Follow steps in the profile.",
      });
    }, 2000);
  };

  if (isOrdered) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <div className="bg-card border rounded-3xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-headline text-4xl mb-4 text-primary">Bon Appétit!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your order has been placed and is currently being prepared by our chefs.
          </p>
          <Button asChild className="w-full font-headline py-6">
            <Link href="/menu">Browse More</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-headline text-5xl mb-12 text-primary">Your Order</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted mb-6" />
          <h2 className="text-2xl font-headline mb-4">Your bag is empty</h2>
          <Button asChild className="font-headline">
            <Link href="/menu">Go to Menu</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto">
                    <Image 
                      src={PlaceHolderImages.find(img => img.id === item.image)?.imageUrl || ""} 
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline text-2xl">{item.name}</h3>
                      <p className="font-headline text-xl text-primary">${item.price}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 border rounded-full px-2 py-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-headline w-4 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full font-headline py-6 text-lg" size="lg" onClick={handleCheckout} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : (
                    <span className="flex items-center gap-2">
                      Checkout <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-3 w-3" /> Secure Payment Powered by Stripe
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
