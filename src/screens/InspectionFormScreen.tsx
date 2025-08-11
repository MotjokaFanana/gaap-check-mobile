import { useEffect, useMemo, useState } from "react";
import config from "@/data/inspectionFormConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate } from "react-router-dom";
import { saveInspection } from "@/utils/storage";
import { exportInspectionAsPDF } from "@/utils/pdf";
import { toast } from "@/hooks/use-toast";

// Types
export type ChecklistStatus = "pass" | "fail" | null;

interface VehicleDetails {
  make: string;
  model: string;
  registration: string;
  mileage: string;
}

interface ChecklistItemState {
  status: ChecklistStatus;
  comment?: string;
}

interface CategoryState {
  [itemId: string]: ChecklistItemState;
}

interface ChecklistState {
  [categoryId: string]: CategoryState;
}

const buildInitialChecklist = (): ChecklistState => {
  const state: ChecklistState = {};
  for (const cat of config.categories) {
    if (cat.id === "comments") continue;
    state[cat.id] = {};
    for (const item of cat.items) {
      state[cat.id][item.id] = { status: null, comment: "" };
    }
  }
  return state;
};

const InspectionFormScreen = () => {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    make: "",
    model: "",
    registration: "",
    mileage: "",
  });
  const [inspectionType, setInspectionType] = useState<string>(config.inspectionTypes[0]);
  const [checklist, setChecklist] = useState<ChecklistState>(buildInitialChecklist);
  const [generalComments, setGeneralComments] = useState<string>("");

  useEffect(() => {
    // Reset checklist when config changes
    setChecklist(buildInitialChecklist());
  }, []);

  const allValid = useMemo(() => {
    return vehicle.make && vehicle.model && vehicle.registration ? true : false;
  }, [vehicle]);

  const updateItem = (categoryId: string, itemId: string, patch: Partial<ChecklistItemState>) => {
    setChecklist((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          ...patch,
        },
      },
    }));
  };

  const onSave = async () => {
    const payload = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      inspectionType,
      vehicle,
      checklist,
      generalComments,
      synced: false,
    };
    await saveInspection(payload);
    toast({ title: "Saved offline", description: "Inspection stored locally." });
    navigate("/reports");
  };

  const onExportPDF = async () => {
    const payload = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      inspectionType,
      vehicle,
      checklist,
      generalComments,
      synced: false,
    };
    await exportInspectionAsPDF(payload);
    toast({ title: "PDF exported", description: "Download started." });
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-3xl mx-auto p-6">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-2xl">New Inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.vehicleFields.map((f) => (
                <div key={f.id} className="space-y-2">
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input
                    id={f.id}
                    type={f.type === "number" ? "number" : "text"}
                    value={(vehicle as any)[f.id]}
                    onChange={(e) => setVehicle((v) => ({ ...v, [f.id]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="inspectionType">Inspection Type</Label>
                <select
                  id="inspectionType"
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                >
                  {config.inspectionTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {config.categories.filter((c) => c.id !== "comments").map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-lg font-semibold">{category.label}</h3>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-5 items-start gap-3">
                      <div className="sm:col-span-2">
                        <Label>{item.label}</Label>
                      </div>
                      <div className="sm:col-span-2">
                        <ToggleGroup
                          type="single"
                          className="inline-flex"
                          value={checklist[category.id][item.id].status ?? undefined as any}
                          onValueChange={(val) => updateItem(category.id, item.id, { status: (val as any) || null })}
                        >
                          <ToggleGroupItem value="pass" aria-label="Pass">Pass</ToggleGroupItem>
                          <ToggleGroupItem value="fail" aria-label="Fail">Fail</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <div className="sm:col-span-1">
                        <Input
                          placeholder="Comment"
                          value={checklist[category.id][item.id].comment || ""}
                          onChange={(e) => updateItem(category.id, item.id, { comment: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="generalComments">General Comments</Label>
              <Textarea
                id="generalComments"
                value={generalComments}
                onChange={(e) => setGeneralComments(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={onSave} disabled={!allValid}>Save Locally</Button>
              <Button variant="secondary" onClick={() => navigate("/")}>Cancel</Button>
              <Button variant="outline" onClick={onExportPDF}>Export PDF</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default InspectionFormScreen;
