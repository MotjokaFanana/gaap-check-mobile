import { useEffect, useMemo, useRef, useState } from "react";
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
import VehicleAutoComplete from "@/components/VehicleAutoComplete";
import { upsertVehicle } from "@/utils/vehicles";
import AppHeader from "@/components/AppHeader";
import DriverSelect from "@/components/DriverSelect";
import { addDriver, getDriver } from "@/utils/drivers";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SignatureCanvas from "@/components/SignatureCanvas";
import { useAuth } from "@/contexts/AuthProvider";
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
  const { displayName } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    make: "",
    model: "",
    registration: "",
    mileage: "",
  });
  const [inspectionType, setInspectionType] = useState<string>(config.inspectionTypes[0]);
  const [checklist, setChecklist] = useState<ChecklistState>(buildInitialChecklist);
  const [generalComments, setGeneralComments] = useState<string>("");
  const [lastKnownMileage, setLastKnownMileage] = useState<number>(0);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: "", license: "", phone: "" });
  const [driverListVersion, setDriverListVersion] = useState(0);
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    // Reset checklist when config changes
    setChecklist(buildInitialChecklist());
  }, []);

  useEffect(() => {
    const current = Number(vehicle.mileage || 0);
    if (lastKnownMileage > 0 && current - lastKnownMileage >= 10000 && !hasWarnedRef.current) {
      toast({ title: "Service due soon", description: "About 10,000 km since last record. Schedule maintenance." });
      hasWarnedRef.current = true;
    }
    if (current - lastKnownMileage < 10000) {
      hasWarnedRef.current = false;
    }
  }, [vehicle.mileage, lastKnownMileage]);
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
    // Upsert vehicle record with latest mileage
    await upsertVehicle({
      registration: vehicle.registration,
      make: vehicle.make,
      model: vehicle.model,
      mileage: Number(vehicle.mileage || 0),
    });

    const payload = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      inspectionType,
      vehicle,
      checklist,
      generalComments,
      inspectorName: displayName || null || undefined,
      driverId,
      driverName,
      signatureDataUrl,
      synced: false,
    } as const;
    await saveInspection(payload as any);
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
      inspectorName: displayName || null || undefined,
      driverId,
      driverName,
      signatureDataUrl,
      synced: false,
    } as const;
    await exportInspectionAsPDF(payload as any);
    toast({ title: "PDF exported", description: "Download started." });
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-3xl mx-auto p-6">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-2xl">New Inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="registration">Registration</Label>
                <VehicleAutoComplete
                  value={vehicle.registration}
                  onChange={(v) => setVehicle((prev) => ({ ...prev, registration: v.toUpperCase() }))}
                  onSelectVehicle={(v) => {
                    setVehicle({
                      registration: v.registration,
                      make: v.make,
                      model: v.model,
                      mileage: String(v.mileage ?? ""),
                    });
                    setLastKnownMileage(Number(v.mileage || 0));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" value={vehicle.make} onChange={(e) => setVehicle((v) => ({ ...v, make: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={vehicle.model} onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input id="mileage" type="number" value={vehicle.mileage} onChange={(e) => setVehicle((v) => ({ ...v, mileage: e.target.value }))} />
              </div>
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

              <div className="space-y-2 sm:col-span-2">
                <Label>Driver</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <DriverSelect key={driverListVersion} value={driverId} onChange={async (id) => {
                      setDriverId(id);
                      if (id) {
                        const d = await getDriver(id);
                        setDriverName(d?.name ?? null);
                      } else {
                        setDriverName(null);
                      }
                    }} />
                  </div>
                  <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">Add Driver</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Driver</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <Label>Name</Label>
                          <Input value={driverForm.name} onChange={(e) => setDriverForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>License</Label>
                          <Input value={driverForm.license} onChange={(e) => setDriverForm((f) => ({ ...f, license: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>Phone</Label>
                          <Input value={driverForm.phone} onChange={(e) => setDriverForm((f) => ({ ...f, phone: e.target.value }))} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" onClick={async () => {
                          if (!driverForm.name.trim()) { toast({ title: "Driver name required" }); return; }
                          const d = await addDriver({ name: driverForm.name.trim(), license: driverForm.license, phone: driverForm.phone });
                          setDriverId(d.id);
                          setDriverName(d.name);
                          setDriverListVersion((v) => v + 1);
                          setDriverDialogOpen(false);
                          setDriverForm({ name: "", license: "", phone: "" });
                          toast({ title: "Driver added" });
                        }}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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

            <div className="space-y-2">
              <Label>Driver Signature</Label>
              <SignatureCanvas value={signatureDataUrl} onChange={setSignatureDataUrl} />
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
