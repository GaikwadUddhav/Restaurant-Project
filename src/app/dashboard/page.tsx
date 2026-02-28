
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Utensils, Calendar, MapPin, CheckCircle, Clock, Sparkles, Loader2 } from "lucide-react";
import { generateMenuDescription } from "@/ai/flows/generate-menu-description";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const [bookings] = useState([
    { id: "B101", user: "John Doe", date: "2024-05-20", time: "19:00", guests: 2, status: "Confirmed" },
    { id: "B102", user: "Jane Smith", date: "2024-05-20", time: "20:30", guests: 4, status: "Pending" },
  ]);

  const [orders, setOrders] = useState([
    { id: "ORD-001", customer: "Alice Brown", total: "$84.00", items: "2x Pasta, 1x Drink", status: "Preparing" },
    { id: "ORD-002", customer: "Bob Wilson", total: "$45.00", items: "1x Steak", status: "Delivery" },
    { id: "ORD-003", customer: "Charlie Davis", total: "$28.00", items: "1x Pasta", status: "Delivered" },
  ]);

  const [aiInput, setAiInput] = useState({ itemName: "", ingredients: "", cuisine: "" });
  const [aiResult, setAiResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleGenerateAI = async () => {
    if (!aiInput.itemName || !aiInput.ingredients) return;
    setIsGenerating(true);
    try {
      const res = await generateMenuDescription({
        itemName: aiInput.itemName,
        ingredients: aiInput.ingredients.split(",").map(i => i.trim()),
        cuisineType: aiInput.cuisine
      });
      setAiResult(res.description);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-headline text-5xl mb-2 text-primary">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurant operations and menus.</p>
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="text-sm px-4 py-1 border-primary/30">
            Store Status: <span className="text-green-600 font-bold ml-1">Open</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="orders" className="rounded-lg px-8">Food Orders</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg px-8">Table Bookings</TabsTrigger>
          <TabsTrigger value="ai-tools" className="rounded-lg px-8">AI Menu Designer</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" /> Active Food Orders
              </CardTitle>
              <CardDescription>Real-time delivery and pickup management.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.items}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          order.status === "Delivered" ? "bg-green-100 text-green-700" :
                          order.status === "Delivery" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        )}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === "Preparing" && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "Delivery")}>Ship</Button>
                          )}
                          {order.status === "Delivery" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "Delivered")}>Complete</Button>
                          )}
                          {order.status === "Delivered" && (
                            <CheckCircle className="h-5 w-5 text-green-600 ml-4" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Reservation Requests
              </CardTitle>
              <CardDescription>Manage table occupancy and booking fees.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.user}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{booking.date}</p>
                          <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === "Confirmed" ? "default" : "outline"}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" /> AI Menu Description Tool
                </CardTitle>
                <CardDescription>Generate enticing descriptions for your new dishes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dish Name</Label>
                  <Input 
                    placeholder="e.g., Summer Truffle Risotto" 
                    value={aiInput.itemName}
                    onChange={e => setAiInput({...aiInput, itemName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Ingredients (comma separated)</Label>
                  <Input 
                    placeholder="Arborio rice, black truffle, parmesan..." 
                    value={aiInput.ingredients}
                    onChange={e => setAiInput({...aiInput, ingredients: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cuisine Style (optional)</Label>
                  <Input 
                    placeholder="Italian, Fusion..." 
                    value={aiInput.cuisine}
                    onChange={e => setAiInput({...aiInput, cuisine: e.target.value})}
                  />
                </div>
                <Button 
                  className="w-full font-headline" 
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !aiInput.itemName}
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Description
                </Button>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-secondary/5">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] bg-background border rounded-xl p-6 italic text-lg leading-relaxed">
                  {aiResult || "Fill in the details and click generate to see the magic..."}
                </div>
                {aiResult && (
                  <Button variant="outline" className="mt-4 w-full" onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    alert("Copied to clipboard!");
                  }}>
                    Copy to Clipboard
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
