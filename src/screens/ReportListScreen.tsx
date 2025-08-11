import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { exportInspectionAsPDF } from "@/utils/pdf";
import { getAllInspections, deleteInspection, type StoredInspection } from "@/utils/storage";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
const ReportListScreen = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<StoredInspection[]>([]);

  useEffect(() => {
    (async () => {
      const all = await getAllInspections();
      setInspections(all.sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1)));
    })();
  }, []);

  const onExport = async (ins: any) => {
    await exportInspectionAsPDF(ins);
  };

  const onDelete = async (id: string) => {
    await deleteInspection(id);
    setInspections((prev) => prev.filter((i) => i.id !== id));
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

        <div className="grid grid-cols-1 gap-4">
          {inspections.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No reports yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Create your first inspection to see it here.</p>
              </CardContent>
            </Card>
          )}
          {inspections.map((ins) => (
            <Card key={ins.id} className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <span>{ins.vehicle.registration}</span>
                  <span className="text-sm text-muted-foreground">{ins.vehicle.make} {ins.vehicle.model}</span>
                  <span className="ml-auto text-sm">{new Date(ins.createdAt).toLocaleString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Type: {ins.inspectionType} • Mileage: {ins.vehicle.mileage} • {ins.synced ? "Synced" : "Offline"}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => onExport(ins)}>Export PDF</Button>
                <Button variant="destructive" onClick={() => onDelete(ins.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ReportListScreen;
