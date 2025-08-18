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

  const onExport = async (ins: Inspection) => {
    // Transform database inspection to StoredInspection format for PDF export
    const transformedInspection = {
      id: ins.id,
      createdAt: ins.created_at,
      inspectionType: ins.inspection_type,
      vehicle: {
        make: ins.vehicle_make,
        model: ins.vehicle_model,
        registration: ins.vehicle_registration,
        mileage: ins.vehicle_mileage?.toString() || '0'
      },
      checklist: ins.checklist,
      generalComments: ins.general_comments,
      inspectorName: ins.inspector_name,
      driverName: ins.driver_name,
      signatureDataUrl: ins.signature_data_url,
      synced: ins.synced
    };
    
    await exportInspectionAsPDF(transformedInspection);
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
      <section className="max-w-4xl mx-auto p-4 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Saved Inspections</h1>
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

        <div className="space-y-4">
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
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">Create your first inspection to see it here.</p>
                <Button onClick={() => navigate("/new")}>Create First Inspection</Button>
              </CardContent>
            </Card>
          ) : (
            inspections.map((ins) => (
              <Card key={ins.id} className="shadow-[var(--shadow-elegant)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-lg">{ins.vehicle_registration}</span>
                      <span className="text-sm text-muted-foreground truncate">
                        {ins.vehicle_make} {ins.vehicle_model}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground sm:ml-auto">
                      {new Date(ins.created_at).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Type: {ins.inspection_type}</span>
                    <span>Mileage: {ins.vehicle_mileage}</span>
                    <span className={ins.synced ? "text-green-600" : "text-orange-600"}>
                      {ins.synced ? "✓ Synced" : "⚬ Offline"}
                    </span>
                  </div>
                  {ins.driver_name && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Driver: {ins.driver_name}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto h-12"
                    onClick={() => onExport(ins)}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto h-12"
                    onClick={() => onDelete(ins.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default ReportListScreen;
