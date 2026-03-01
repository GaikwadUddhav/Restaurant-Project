
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Utensils, Calendar, CheckCircle, Clock, Sparkles, Loader2, Plus, LayoutGrid, Trash2, CheckCircle2, Circle } from "lucide-react";
import { generateMenuDescription } from "@/ai/flows/generate-menu-description";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, collectionGroup } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const db = useFirestore();
  const { toast } = useToast();

  // AI State
  const [aiInput, setAiInput] = useState({ itemName: "", ingredients: "", cuisine: "Indian" });
  const [aiResult, setAiResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Table Management State
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: 2, description: "" });
  const [isAddingTable, setIsAddingTable] = useState(false);

  // Real Queries
  const tablesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "restaurantTables");
  }, [db]);
  const { data: tables, isLoading: isLoadingTables } = useCollection(tablesQuery);

  const reservationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collectionGroup(db, "reservations");
  }, [db]);
  const { data: reservations, isLoading: isLoadingReservations } = useCollection(reservationsQuery);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collectionGroup(db, "foodOrders");
  }, [db]);
  const { data: orders, isLoading: isLoadingOrders } = useCollection(ordersQuery);

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

  const handleAddTable = () => {
    if (!newTable.tableNumber) return;
    setIsAddingTable(true);
    const tableRef = collection(db, "restaurantTables");
    const id = Math.random().toString(36).substr(2, 9);
    
    addDocumentNonBlocking(tableRef, { ...newTable, id })
      .then(() => {
        setNewTable({ tableNumber: "", capacity: 2, description: "" });
        setIsAddingTable(false);
        toast({ title: "Table Added", description: `Table ${newTable.tableNumber} is now available for booking.` });
      })
      .catch(() => setIsAddingTable(false));
  };

  const handleDeleteTable = (id: string) => {
    const tableRef = doc(db, "restaurantTables", id);
    deleteDocumentNonBlocking(tableRef);
    toast({ title: "Table Removed", description: "The table has been deleted from the floor plan." });
  };

  const updateOrderStatus = (customerId: string, orderId: string, newStatus: string) => {
    const orderRef = doc(db, "customerProfiles", customerId, "foodOrders", orderId);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    toast({ title: "Order Updated", description: `Status changed to ${newStatus}.` });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="font-headline text-5xl mb-2 text-primary">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage Patil Table Indian restaurant operations.</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-1 border-primary/30">
          Store Status: <span className="text-green-600 font-bold ml-1">Open</span>
        </Badge>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-xl w-full md:w-auto overflow-x-auto justify-start flex">
          <TabsTrigger value="orders" className="rounded-lg px-8">Orders</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg px-8">Bookings</TabsTrigger>
          <TabsTrigger value="tables" className="rounded-lg px-8">Tables</TabsTrigger>
          <TabsTrigger value="ai-tools" className="rounded-lg px-8">AI Designer</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                <Utensils className="h-5 w-5" /> Active Food Orders
              </CardTitle>
              <CardDescription>Real-time Indian cuisine delivery management.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />Loading orders...</div>
              ) : orders?.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground italic">No orders placed yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.orderDateTime).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold text-primary">${order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-bold uppercase tracking-tighter text-[10px]",
                            order.status === "Delivered" ? "bg-green-600 text-white" :
                            order.status === "Out for Delivery" ? "bg-blue-600 text-white" :
                            "bg-yellow-500 text-white"
                          )}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status === "Pending" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.customerId, order.id, "Preparing")}>Start Prep</Button>
                            )}
                            {order.status === "Preparing" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.customerId, order.id, "Out for Delivery")}>Ship</Button>
                            )}
                            {order.status === "Out for Delivery" && (
                              <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => updateOrderStatus(order.customerId, order.id, "Delivered")}>Complete</Button>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5" /> Reservation Requests
              </CardTitle>
              <CardDescription>Manage Patil Table seating and booking fees.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReservations ? (
                <div className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />Loading bookings...</div>
              ) : reservations?.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground italic">No reservations booked yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Table Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations?.map((booking) => {
                      const table = tables?.find(t => t.id === booking.tableId);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-bold">{new Date(booking.reservationDateTime).toLocaleDateString()}</p>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {new Date(booking.reservationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.numberOfGuests} Guests</TableCell>
                          <TableCell className="font-bold text-primary">{table?.tableNumber || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "font-bold uppercase tracking-tighter text-[10px]",
                              booking.status === "Confirmed" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                            )}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                  <Plus className="h-5 w-5" /> Add New Table
                </CardTitle>
                <CardDescription>Register your restaurant's physical seating.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Table Label</Label>
                  <Input 
                    placeholder="e.g., Table 7, Booth C" 
                    value={newTable.tableNumber}
                    onChange={e => setNewTable({...newTable, tableNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Seating Capacity</Label>
                  <Input 
                    type="number"
                    value={newTable.capacity}
                    onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description/Location</Label>
                  <Input 
                    placeholder="e.g., Near window, Quiet area" 
                    value={newTable.description}
                    onChange={e => setNewTable({...newTable, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleAddTable} disabled={isAddingTable}>
                  {isAddingTable ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Register Table
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                  <LayoutGrid className="h-5 w-5" /> Floor Plan Overview
                </CardTitle>
                <CardDescription>Green = Currently Booked, White = Available for selection.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTables ? (
                  <div className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />Loading floor plan...</div>
                ) : tables?.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                    <LayoutGrid className="h-12 w-12 mx-auto text-muted mb-4 opacity-20" />
                    <p className="text-muted-foreground italic">No tables defined yet. Start by adding one!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables?.map((table) => {
                        const isBooked = reservations?.some(res => res.tableId === table.id && res.status === "Confirmed");
                        return (
                          <TableRow key={table.id} className={cn(isBooked ? "bg-green-50/50" : "bg-white")}>
                            <TableCell className="font-bold text-primary">{table.tableNumber}</TableCell>
                            <TableCell>{table.capacity} People</TableCell>
                            <TableCell>
                              <Badge 
                                variant={isBooked ? "default" : "outline"} 
                                className={cn(
                                  "font-bold uppercase tracking-tighter text-[10px]",
                                  isBooked ? "bg-green-600 border-green-600 text-white" : "bg-white text-muted-foreground border-muted-foreground/30"
                                )}
                              >
                                {isBooked ? (
                                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Booked</span>
                                ) : (
                                  <span className="flex items-center gap-1"><Circle className="h-3.5 w-3.5" /> Available</span>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTable(table.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5 text-secondary" /> AI Menu Description Tool
                </CardTitle>
                <CardDescription>Generate enticing Indian menu descriptions.</CardDescription>
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
                    placeholder="Indian, Fusion..." 
                    value={aiInput.cuisine}
                    onChange={e => setAiInput({...aiInput, cuisine: e.target.value})}
                  />
                </div>
                <Button 
                  className="w-full font-headline bg-primary" 
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
                    toast({
                      title: "Copied!",
                      description: "Description copied to clipboard.",
                    });
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
