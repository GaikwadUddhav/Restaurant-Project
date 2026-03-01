
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Clock, CalendarDays, CheckCircle2, Users, UtensilsCrossed, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCollection, useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, collectionGroup, doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ReservationPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState("2");
  const [time, setTime] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize date on client to avoid hydration mismatch
  useEffect(() => {
    setDate(new Date());
  }, []);

  // Fetch all tables
  const tablesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "restaurantTables");
  }, [db]);
  const { data: allTables, isLoading: isLoadingTables } = useCollection(tablesQuery);

  // Fetch all reservations to check real-time availability
  const reservationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collectionGroup(db, "reservations");
  }, [db]);
  const { data: allReservations } = useCollection(reservationsQuery);

  // Calculate selection ISO string for checking availability
  const currentSelectionIso = useMemo(() => {
    if (!date || !time) return null;
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return selectedDateTime.toISOString();
  }, [date, time]);

  // Filter tables based on guest count and availability
  const displayTables = useMemo(() => {
    if (!allTables) return [];
    
    // First, filter by capacity as a hard requirement
    const byCapacity = allTables.filter(table => table.capacity >= parseInt(guests));
    
    // Map them with their availability status for the selected date/time
    return byCapacity.map(table => {
      const isBooked = allReservations?.some(res => 
        res.tableId === table.id && 
        res.reservationDateTime === currentSelectionIso && 
        res.status !== "Cancelled"
      );
      return { ...table, isBooked };
    });
  }, [allTables, allReservations, guests, currentSelectionIso]);

  const handleBooking = () => {
    if (isUserLoading || !user) {
      toast({
        variant: "destructive",
        title: "Initializing session",
        description: "Please wait a moment while we set up your secure session.",
      });
      return;
    }

    if (!date || !time || !selectedTableId) {
      toast({
        variant: "destructive",
        title: "Selection Incomplete",
        description: "Please pick a date, time, and an available table to continue.",
      });
      return;
    }

    setIsSubmitting(true);

    const reservationId = Math.random().toString(36).substr(2, 9);
    const reservationRef = doc(db, "customerProfiles", user.uid, "reservations", reservationId);
    
    const reservationData = {
      id: reservationId,
      customerId: user.uid,
      tableId: selectedTableId,
      reservationDateTime: currentSelectionIso,
      numberOfGuests: parseInt(guests),
      status: "Confirmed",
      bookingFeeAmount: 50,
      paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      specialRequests: "",
      createdAt: new Date().toISOString()
    };

    // Use setDocumentNonBlocking for deterministic ID creation
    setDocumentNonBlocking(reservationRef, reservationData, { merge: true });
    
    // Proceed optimistically
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Reservation Successful",
        description: "Your table at Patil Table has been reserved.",
      });
    }, 800);
  };

  if (isSuccess) {
    const selectedTable = allTables?.find(t => t.id === selectedTableId);
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-card border rounded-3xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-headline text-4xl mb-4 text-green-700">Confirmed!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            We've reserved <strong>{selectedTable?.tableNumber}</strong> for your Indian feast.
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
                <p className="font-medium text-green-600 font-bold">{selectedTable?.tableNumber}</p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full font-headline bg-green-600 hover:bg-green-700">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl mb-2 text-primary">Reserve Your Table</h1>
        <p className="text-muted-foreground text-lg">Choose a preferred table and time for your Patil Table experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" /> 1. Select Date & Guests
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setSelectedTableId(""); }}
                  className="rounded-md border mx-auto bg-white shadow-sm"
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><Users className="h-4 w-4" /> Number of Guests</Label>
                  <Select value={guests} onValueChange={(v) => { setGuests(v); setSelectedTableId(""); }}>
                    <SelectTrigger className="bg-white border-primary/20">
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
                  <Label className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4" /> Choose Time Slot</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => (
                      <Button
                        key={t}
                        variant={time === t ? "default" : "outline"}
                        className={cn(
                          "font-body transition-all", 
                          time === t ? "bg-primary text-primary-foreground scale-105" : "bg-white border-primary/20 hover:border-primary/50"
                        )}
                        onClick={() => { setTime(t); setSelectedTableId(""); }}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("bg-white border-none shadow-md transition-all duration-300", !date || !time ? "opacity-40 grayscale pointer-events-none" : "opacity-100")}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                <UtensilsCrossed className="h-5 w-5" /> 2. Pick a Table
              </CardTitle>
              <CardDescription>
                White = Available, <span className="text-green-600 font-bold">Green = Your Selection</span>, Gray = Occupied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTables ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="italic text-primary">Checking floor plan...</p>
                </div>
              ) : displayTables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayTables.map(table => (
                    <button
                      key={table.id}
                      disabled={table.isBooked}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        "flex flex-col p-5 border-2 rounded-2xl text-left transition-all duration-300 group shadow-sm",
                        selectedTableId === table.id 
                          ? "bg-green-600 border-green-600 text-white transform scale-105 z-10" 
                          : table.isBooked
                            ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-60"
                            : "bg-white border-border hover:border-green-400 hover:shadow-md"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={cn(
                          "font-headline text-2xl font-bold", 
                          selectedTableId === table.id ? "text-white" : table.isBooked ? "text-muted-foreground" : "text-primary"
                        )}>
                          {table.tableNumber}
                        </span>
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider", 
                          selectedTableId === table.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          Seats {table.capacity}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed mb-4", 
                        selectedTableId === table.id ? "text-white/90" : "text-muted-foreground"
                      )}>
                        {table.isBooked ? "Currently reserved for this time." : (table.description || "A wonderful spot for Indian dining.")}
                      </p>
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold uppercase transition-opacity", 
                        selectedTableId === table.id 
                          ? "text-white opacity-100" 
                          : table.isBooked 
                            ? "text-muted-foreground opacity-100" 
                            : "text-green-600 opacity-0 group-hover:opacity-100"
                      )}>
                        {table.isBooked ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {table.isBooked ? "Unavailable" : selectedTableId === table.id ? "Selected" : "Pick this table"}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="font-headline text-2xl mb-2 text-muted-foreground">No matching tables</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">Try changing the number of guests or picking another time slot.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 border-green-200 bg-green-50 shadow-xl overflow-hidden">
            <div className="h-2 bg-green-600 w-full" />
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-2xl text-green-800">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700/60">Date</span>
                  <span className="font-headline text-lg text-green-900">{date?.toLocaleDateString() || "---"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700/60">Time</span>
                  <span className="font-headline text-lg text-green-900">{time || "---"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700/60">Guests</span>
                  <span className="font-headline text-lg text-green-900">{guests} People</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700/60">Table</span>
                  <span className="font-headline text-lg text-green-600 font-bold">
                    {allTables?.find(t => t.id === selectedTableId)?.tableNumber || "---"}
                  </span>
                </div>
              </div>
              
              <Separator className="bg-green-200" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-green-800">Booking Fee</span>
                <span className="font-headline text-2xl text-green-900">$50.00</span>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full font-headline py-7 text-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 active:scale-95 transition-transform" 
                  size="lg"
                  disabled={isSubmitting || !selectedTableId || isUserLoading}
                  onClick={handleBooking}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" /> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6" /> Confirm & Book
                    </span>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[10px] text-center text-green-700 uppercase tracking-[0.2em] font-black">
                    Secure Indian Payment
                  </p>
                  <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
