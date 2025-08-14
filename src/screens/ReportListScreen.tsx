import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportInspectionAsPDF } from "@/utils/pdf";
import { getAllInspections, deleteInspection, type Inspection } from "@/utils/database";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";

const ReportListScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadInspections = async () => {
      try {
        setLoading(true);
        const all = await getAllInspections();
        setInspections(all);
      } catch (error) {
        console.error("Error loading inspections:", error);
        toast.error("Failed to load inspections");
      } finally {
        setLoading(false);
      }
    };
    
    loadInspections();
  }, [user, navigate]);

  const onExport = async (ins: any) => {
    await exportInspectionAsPDF(ins);
  };

  const onDelete = async (id: string) => {
    try {
      await deleteInspection(id);
      setInspections((prev) => prev.filter((i) => i.id !== id));
      toast.success("Inspection deleted");
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast.error("Failed to delete inspection");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-4xl mx-auto p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved Inspections</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/")}>Home</Button>
            <Button onClick={() => navigate("/new")}>New</Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 gap-4 pr-4">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Fetching your inspection reports...</p>
                </CardContent>
              </Card>
            ) : inspections.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No reports yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create your first inspection to see it here.</p>
                </CardContent>
              </Card>
            ) : (
              inspections.map((ins) => (
                <Card key={ins.id} className="shadow-[var(--shadow-elegant)]">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      <span>{ins.vehicle_registration}</span>
                      <span className="text-sm text-muted-foreground">{ins.vehicle_make} {ins.vehicle_model}</span>
                      <span className="ml-auto text-sm">{new Date(ins.created_at).toLocaleString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Type: {ins.inspection_type} • Mileage: {ins.vehicle_mileage} • {ins.synced ? "Synced" : "Offline"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onExport(ins)}>Export PDF</Button>
                    <Button variant="destructive" onClick={() => onDelete(ins.id)}>Delete</Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </section>
    </main>
  );
};

export default ReportListScreen;
