import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Calendar, ShoppingBag, Star } from "lucide-react";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-restaurant");
  const pastaImg = PlaceHolderImages.find(img => img.id === "food-pasta");
  const steakImg = PlaceHolderImages.find(img => img.id === "food-steak");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src={heroImg?.imageUrl || ""}
          alt={heroImg?.description || ""}
          fill
          className="object-cover opacity-80"
          priority
          data-ai-hint="restaurant interior"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="font-headline text-5xl md:text-7xl mb-6 drop-shadow-lg">
            A Symphony of Flavors Awaits
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-body opacity-90 drop-shadow-md">
            Experience culinary excellence with every bite. Book your exquisite table today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 font-headline h-14" asChild>
              <Link href="/reserve">
                <Calendar className="mr-2 h-5 w-5" /> Reserve a Table
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 font-headline h-14" asChild>
              <Link href="/menu">
                <ShoppingBag className="mr-2 h-5 w-5" /> Order Online
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl mb-4">Chef's Recommendations</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturedCard 
              image={pastaImg?.imageUrl || ""} 
              title="Truffle Tagliatelle" 
              price="$28" 
              description="Hand-crafted pasta with winter truffles and aged parmesan."
            />
            <FeaturedCard 
              image={steakImg?.imageUrl || ""} 
              title="Herb-Crusted Ribeye" 
              price="$45" 
              description="Premium cut of beef with a rosemary and garlic infusion."
            />
             <FeaturedCard 
              image={PlaceHolderImages.find(img => img.id === "food-cocktail")?.imageUrl || ""} 
              title="Signature Hibiscus" 
              price="$16" 
              description="A vibrant botanical gin cocktail with a touch of elderflower."
            />
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild className="font-headline group">
              <Link href="/menu">
                View Full Menu <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Promo */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="font-headline text-4xl mb-6">Guaranteed Seating</h2>
              <p className="text-xl opacity-90 mb-8">
                Reserve your favorite spot for just $50. The booking fee guarantees your table for the entire evening, allowing you to relax and enjoy your meal.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Star className="h-5 w-5 text-secondary" /> Priority Service</li>
                <li className="flex items-center gap-3"><Star className="h-5 w-5 text-secondary" /> Choice of Preferred Table</li>
                <li className="flex items-center gap-3"><Star className="h-5 w-5 text-secondary" /> Complimentary Welcome Drink</li>
              </ul>
              <Button variant="secondary" size="lg" asChild className="font-headline">
                <Link href="/reserve">Reserve Now</Link>
              </Button>
            </div>
            <div className="w-full md:w-1/3 aspect-square relative rounded-full overflow-hidden border-4 border-secondary/30">
              <Image 
                src={PlaceHolderImages.find(img => img.id === "table-setting")?.imageUrl || ""}
                alt="Table setting"
                fill
                className="object-cover"
                data-ai-hint="table setting"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedCard({ image, title, price, description }: { image: string, title: string, price: string, description: string }) {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border">
      <div className="relative h-64 overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="food item"
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-headline">
          {price}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-headline text-2xl mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <Button variant="link" className="p-0 text-primary h-auto font-headline group-hover:translate-x-1 transition-transform" asChild>
          <Link href="/menu">Order Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}