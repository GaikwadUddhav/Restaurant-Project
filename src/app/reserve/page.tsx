
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Users, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ReservationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [guests, setGuests] = useState("2");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleBooking = () => {
    if (!date || !time) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both a date and a time slot.",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Table Reserved!",
        description: "Your $50 booking fee has been processed successfully.",
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-card border rounded-3xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-4xl mb-4">Reservation Confirmed!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for choosing TableTap. We've sent a confirmation email to your account.
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
                <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Booking Fee</p>
                <p className="font-medium text-primary">$50.00 Paid</p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full font-headline">
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl mb-2 text-primary">Book a Table</h1>
        <p className="text-muted-foreground text-lg">Reserve your exquisite dining experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {/* Selection Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> 1. Select Date & Time
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
                  <Label>Number of Guests</Label>
                  <Select value={guests} onValueChange={setGuests}>
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
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => (
                      <Button
                        key={t}
                        variant={time === t ? "default" : "outline"}
                        className="font-body"
                        onClick={() => setTime(t)}
                      >
                        <Clock className="mr-2 h-4 w-4" /> {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Column */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Summary</CardTitle>
              <CardDescription>A mandatory booking fee applies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{date?.toDateString() || "Not selected"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{time || "Not selected"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-medium">{guests} People</span>
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
                  disabled={isSubmitting}
                  onClick={handleBooking}
                >
                  {isSubmitting ? "Processing..." : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Confirm & Pay $50
                    </span>
                  )}
                </Button>
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
