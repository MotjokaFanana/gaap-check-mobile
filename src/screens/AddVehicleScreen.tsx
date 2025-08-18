import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createVehicle, updateVehicle, getAllVehicles, deleteVehicle, type Vehicle } from "@/utils/database";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
const AddVehicleScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ registration: "", make: "", model: "", mileage: "" });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const disabled = useMemo(() => !form.registration || !form.make || !form.model, [form]);

  const load = async () => {
    try {
      setLoading(true);
      const v = await getAllVehicles();
      setVehicles(v);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
  }, [user, navigate]);

  const onSave = async () => {
    if (!user) {
      toast.error("Please log in to save vehicles");
      return;
    }

    try {
      // Check if vehicle exists for update
      const existingVehicle = vehicles.find(v => v.registration.toUpperCase() === form.registration.toUpperCase());
      
      if (existingVehicle) {
        await updateVehicle(form.registration, {
          make: form.make,
          model: form.model,
          mileage: Number(form.mileage || 0),
        });
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle({
          registration: form.registration,
          make: form.make,
          model: form.model,
          mileage: Number(form.mileage || 0),
        });
        toast.success("Vehicle created successfully");
      }
      
      setForm({ registration: "", make: "", model: "", mileage: "" });
      load();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error("Failed to save vehicle");
    }
  };

  const onDelete = async (reg: string) => {
    try {
      await deleteVehicle(reg);
      toast.success("Vehicle deleted");
      load();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Manage Vehicles</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              className="flex-1 sm:flex-none h-12"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button 
              className="flex-1 sm:flex-none h-12"
              onClick={() => navigate("/new")}
            >
              New Inspection
            </Button>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-elegant)] animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Add / Update Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registration">Registration *</Label>
              <Input 
                id="registration" 
                className="h-12"
                value={form.registration}
                onChange={(e) => setForm((f) => ({ ...f, registration: e.target.value.toUpperCase() }))}
                placeholder="e.g. ABC123GP" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input 
                  id="make" 
                  className="h-12"
                  value={form.make} 
                  onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input 
                  id="model" 
                  className="h-12"
                  value={form.model} 
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input 
                id="mileage" 
                type="number" 
                className="h-12"
                value={form.mileage} 
                onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))} 
                placeholder="Current odometer reading"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              disabled={disabled} 
              onClick={onSave}
              className="w-full h-12 text-base font-medium"
            >
              Save Vehicle
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-lg">Saved Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No vehicles saved yet. Add your first vehicle above.</p>
                </div>
              ) : (
                vehicles.map((v) => (
                  <Card key={v.registration} className="shadow-[var(--shadow-elegant)] animate-fade-in">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-lg">{v.registration}</span>
                          <span className="text-muted-foreground text-sm truncate">
                            {v.make} {v.model}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground sm:ml-auto">
                          Mileage: {v.mileage}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                      <div className="text-sm text-muted-foreground">
                        Updated: {new Date(v.updated_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="destructive" 
                        className="w-full h-12"
                        onClick={() => onDelete(v.registration)}
                      >
                        Delete Vehicle
                      </Button>
                    </CardFooter>
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

export default AddVehicleScreen;
