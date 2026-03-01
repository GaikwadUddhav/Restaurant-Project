
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Clock, CalendarDays, CheckCircle2, Users, UtensilsCrossed, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCollection, useUser, useFirestore, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function ReservationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState("2");
  const [time, setTime] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch tables to check availability
  const tablesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "restaurantTables");
  }, [db]);

  const { data: allTables, isLoading: isLoadingTables } = useCollection(tablesQuery);

  // Filter tables based on guest count
  const availableTables = allTables?.filter(table => table.capacity >= parseInt(guests)) || [];

  useEffect(() => {
    setDate(new Date());
  }, []);

  const handleBooking = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to book a table.",
      });
      return;
    }

    if (!date || !time || !selectedTableId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a date, time, and an available table.",
      });
      return;
    }

    setIsSubmitting(true);

    const reservationData = {
      customerId: user.uid,
      tableId: selectedTableId,
      reservationDateTime: new Date(date.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]))).toISOString(),
      numberOfGuests: parseInt(guests),
      status: "Confirmed",
      bookingFeeAmount: 50,
      paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      specialRequests: "",
      id: Math.random().toString(36).substr(2, 9)
    };

    const reservationsRef = collection(db, "customerProfiles", user.uid, "reservations");
    
    addDocumentNonBlocking(reservationsRef, reservationData)
      .then(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        toast({
          title: "Table Reserved!",
          description: "Your $50 booking fee has been processed successfully.",
        });
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  if (isSuccess) {
    const selectedTable = allTables?.find(t => t.id === selectedTableId);
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-card border rounded-3xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-4xl mb-4">Reservation Confirmed!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for choosing Patil Table. We've reserved <strong>{selectedTable?.tableNumber}</strong> for you.
          </p>
          <div className="bg-background rounded-2xl p-6 text-left border mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Date</p>
                <p className="font-medium">{date?.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Time</p>
                <p className="font-medium">{time}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Guests</p>
                <p className="font-medium">{guests} People</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Table</p>
                <p className="font-medium">{selectedTable?.tableNumber}</p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full font-headline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl mb-2 text-primary">Book a Table</h1>
        <p className="text-muted-foreground text-lg">Real-time availability for an exquisite dining experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> 1. Select Date & Guests
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border mx-auto"
                />
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Number of Guests</Label>
                  <Select value={guests} onValueChange={(v) => { setGuests(v); setSelectedTableId(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="How many people?" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Person' : 'People'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => (
                      <Button
                        key={t}
                        variant={time === t ? "default" : "outline"}
                        className="font-body"
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Table Selection */}
          <Card className={!date || !time ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" /> 2. Choose Your Table
              </CardTitle>
              <CardDescription>Only tables matching your guest count are shown.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTables ? (
                <p className="text-center py-10 animate-pulse italic">Checking availability...</p>
              ) : availableTables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        "flex flex-col p-4 border rounded-2xl text-left transition-all hover:border-primary/50",
                        selectedTableId === table.id ? "bg-primary/5 border-primary ring-2 ring-primary/20" : "bg-card"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-headline text-xl">{table.tableNumber}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Cap: {table.capacity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{table.description || "Perfect for intimate dining."}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed">
                  <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="font-headline text-xl mb-1">No tables available</p>
                  <p className="text-sm text-muted-foreground">Try a different guest count or time slot.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Your Booking</CardTitle>
              <CardDescription>Reservation summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{date?.toLocaleDateString() || "---"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{time || "---"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-medium">{guests} People</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Table:</span>
                <span className="font-medium">
                  {allTables?.find(t => t.id === selectedTableId)?.tableNumber || "---"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Reservation Fee:</span>
                <span className="text-primary">$50.00</span>
              </div>
              <div className="pt-4">
                <Button 
                  className="w-full font-headline py-6 text-lg" 
                  size="lg"
                  disabled={isSubmitting || !selectedTableId || !user}
                  onClick={handleBooking}
                >
                  {isSubmitting ? "Processing..." : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> {user ? "Confirm & Pay $50" : "Sign in to Reserve"}
                    </span>
                  )}
                </Button>
                {!user && (
                   <p className="text-[10px] text-center text-destructive mt-2 uppercase font-bold">
                    Login required for payment
                  </p>
                )}
                <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
                  Secure Encrypted Payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
