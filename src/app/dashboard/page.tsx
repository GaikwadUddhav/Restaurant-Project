
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Utensils, Calendar, CheckCircle, Clock, Sparkles, Loader2, Plus, LayoutGrid, Trash2 } from "lucide-react";
import { generateMenuDescription } from "@/ai/flows/generate-menu-description";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const [bookings] = useState([
    { id: "B101", user: "John Doe", date: "2024-05-20", time: "19:00", guests: 2, status: "Confirmed" },
    { id: "B102", user: "Jane Smith", date: "2024-05-20", time: "20:30", guests: 4, status: "Pending" },
  ]);

  const [orders, setOrders] = useState([
    { id: "ORD-001", customer: "Alice Brown", total: "$84.00", items: "2x Butter Chicken, 1x Naan", status: "Preparing" },
    { id: "ORD-002", customer: "Bob Wilson", total: "$45.00", items: "1x Biryani", status: "Delivery" },
    { id: "ORD-003", customer: "Charlie Davis", total: "$28.00", items: "1x Paneer Tikka", status: "Delivered" },
  ]);

  // AI State
  const [aiInput, setAiInput] = useState({ itemName: "", ingredients: "", cuisine: "Indian" });
  const [aiResult, setAiResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Table Management State
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: 2, description: "" });
  const [isAddingTable, setIsAddingTable] = useState(false);

  const tablesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "restaurantTables");
  }, [db]);

  const { data: tables, isLoading: isLoadingTables } = useCollection(tablesQuery);

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
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" /> Active Food Orders
              </CardTitle>
              <CardDescription>Real-time Indian cuisine delivery management.</CardDescription>
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
              <CardDescription>Manage Patil Table seating and booking fees.</CardDescription>
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
                        <Badge className={cn(
                          booking.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-muted"
                        )}>
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

        <TabsContent value="tables">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Add New Table
                </CardTitle>
                <CardDescription>Define table capacity and numbers for Patil Table.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Table Number/Name</Label>
                  <Input 
                    placeholder="e.g., Table 12, Booth A" 
                    value={newTable.tableNumber}
                    onChange={e => setNewTable({...newTable, tableNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (Guests)</Label>
                  <Input 
                    type="number"
                    value={newTable.capacity}
                    onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="e.g., Window seat, Quiet corner" 
                    value={newTable.description}
                    onChange={e => setNewTable({...newTable, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAddTable} disabled={isAddingTable}>
                  {isAddingTable ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Register Table
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" /> Floor Plan Management
                </CardTitle>
                <CardDescription>Current seating available for Indian dining reservations.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTables ? (
                  <p className="text-center py-10">Loading floor plan...</p>
                ) : tables?.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground italic">No tables defined yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables?.map((table) => (
                        <TableRow key={table.id}>
                          <TableCell className="font-bold text-green-800">{table.tableNumber}</TableCell>
                          <TableCell>{table.capacity} People</TableCell>
                          <TableCell className="text-xs italic">{table.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white text-green-600 border-green-200">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTable(table.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
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
