
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ShoppingBag, Plus, Minus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { id: 1, name: "Truffle Tagliatelle", price: 28, category: "Mains", image: "food-pasta", description: "Rich cream sauce with seasonal truffles." },
  { id: 2, name: "Herb-Crusted Ribeye", price: 45, category: "Mains", image: "food-steak", description: "300g premium beef with roasted vegetables." },
  { id: 3, name: "Burrata Salad", price: 18, category: "Starters", image: "food-salad", description: "Creamy burrata with heirloom tomatoes and pesto." },
  { id: 4, name: "Lava Cake", price: 12, category: "Desserts", image: "food-dessert", description: "Warm chocolate core with raspberry coulis." },
  { id: 5, name: "Hibiscus Gin", price: 16, category: "Drinks", image: "food-cocktail", description: "Floral and refreshing signature mix." },
  { id: 6, name: "Wild Mushroom Risotto", price: 26, category: "Mains", image: "food-pasta", description: "Arborio rice with porcini and truffle oil." },
];

const categories = ["All", "Starters", "Mains", "Desserts", "Drinks"];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemName: string) => {
    toast({
      title: "Added to Cart",
      description: `${itemName} has been added to your shopping bag.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="font-headline text-5xl mb-2 text-primary">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Hand-picked ingredients for an unforgettable experience.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search our dishes..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
            className="rounded-full px-6"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map(item => (
          <div key={item.id} className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative h-56">
              <Image 
                src={PlaceHolderImages.find(img => img.id === item.image)?.imageUrl || ""} 
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                data-ai-hint="menu item"
              />
              <Badge className="absolute top-4 left-4 font-headline bg-background/90 text-foreground border-none">
                {item.category}
              </Badge>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline text-2xl">{item.name}</h3>
                <span className="font-headline text-primary text-xl">${item.price}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 flex-1">{item.description}</p>
              <Button className="w-full font-headline" variant="outline" onClick={() => addToCart(item.name)}>
                <Plus className="mr-2 h-4 w-4" /> Add to Order
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No dishes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
