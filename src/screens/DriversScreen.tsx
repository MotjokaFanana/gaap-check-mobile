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
      <section className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Manage Drivers</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              className="flex-1 sm:flex-none h-12"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 sm:flex-none h-12"
                  onClick={openNewDriverDialog}
                >
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      className="h-12"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      className="h-12"
                      value={form.license}
                      onChange={(e) => setForm(f => ({ ...f, license: e.target.value }))}
                      placeholder="License number (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      className="h-12"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone number (optional)"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={handleSave}
                  >
                    {editingDriver ? "Update" : "Add"} Driver
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-lg">All Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-lg font-semibold">{driver.name}</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 sm:flex-none h-10"
                            onClick={() => handleEdit(driver)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 sm:flex-none h-10"
                            onClick={() => handleDelete(driver.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground space-y-1">
                        {driver.license && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">License:</span>
                            <span>{driver.license}</span>
                          </div>
                        )}
                        {driver.phone && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            <span>{driver.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Added:</span>
                          <span>{new Date(driver.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DriversScreen;