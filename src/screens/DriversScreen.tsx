import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllDrivers, createDriver, updateDriver, deleteDriver, type Driver } from "@/utils/database";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";

const DriversScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ name: "", license: "", phone: "" });

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const allDrivers = await getAllDrivers();
      setDrivers(allDrivers);
    } catch (error) {
      console.error("Error loading drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDrivers();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Driver name is required");
      return;
    }

    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, {
          name: form.name.trim(),
          license: form.license || undefined,
          phone: form.phone || undefined,
        });
        toast.success("Driver updated successfully");
      } else {
        await createDriver({
          name: form.name.trim(),
          license: form.license || undefined,
          phone: form.phone || undefined,
        });
        toast.success("Driver created successfully");
      }
      
      setForm({ name: "", license: "", phone: "" });
      setEditingDriver(null);
      setDialogOpen(false);
      loadDrivers();
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error("Failed to save driver");
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      license: driver.license || "",
      phone: driver.phone || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDriver(id);
      toast.success("Driver deleted successfully");
      loadDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Failed to delete driver");
    }
  };

  const openNewDriverDialog = () => {
    setEditingDriver(null);
    setForm({ name: "", license: "", phone: "" });
    setDialogOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Drivers</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/")}>Home</Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDriverDialog}>Add Driver</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={form.license}
                      onChange={(e) => setForm(f => ({ ...f, license: e.target.value }))}
                      placeholder="License number (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone number (optional)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingDriver ? "Update" : "Add"} Driver
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle>All Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 pr-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading drivers...</p>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No drivers added yet. Add your first driver above.</p>
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <Card key={driver.id} className="shadow-[var(--shadow-elegant)]">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{driver.name}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(driver)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(driver.id)}>
                              Delete
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {driver.license && <div>License: {driver.license}</div>}
                          {driver.phone && <div>Phone: {driver.phone}</div>}
                          <div>Added: {new Date(driver.created_at).toLocaleString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DriversScreen;