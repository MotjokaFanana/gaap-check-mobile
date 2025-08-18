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
import { createVehicle, updateVehicle, getAllVehicles, createInspection, createDriver, getAllDrivers } from "@/utils/database";
import AppHeader from "@/components/AppHeader";
import DriverSelect from "@/components/DriverSelect";
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
    try {
      // Ensure a vehicle record exists for THIS user (FK requires user_id + registration)
      try {
        await createVehicle({
          registration: vehicle.registration,
          make: vehicle.make,
          model: vehicle.model,
          mileage: Number(vehicle.mileage || 0),
        });
      } catch (e: any) {
        // If it already exists for this user, update it instead
        const code = e?.code || e?.cause?.code;
        if (code === "23505") {
          await updateVehicle(vehicle.registration, {
            make: vehicle.make,
            model: vehicle.model,
            mileage: Number(vehicle.mileage || 0),
          });
        } else {
          throw e;
        }
      }

      // Save inspection to database
      const inspectionDbData = {
        inspection_type: inspectionType,
        vehicle_registration: vehicle.registration.toUpperCase(),
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_mileage: Number(vehicle.mileage || 0),
        checklist,
        general_comments: generalComments || undefined,
        inspector_name: displayName || undefined,
        driver_id: driverId || undefined,
        driver_name: driverName || undefined,
        signature_data_url: signatureDataUrl || undefined,
      };

      const savedInspection = await createInspection(inspectionDbData);

      // Also save locally for offline access
      const localPayload = {
        id: savedInspection.id,
        createdAt: savedInspection.created_at,
        inspectionType,
        vehicle,
        checklist,
        generalComments,
        inspectorName: displayName || null || undefined,
        driverId,
        driverName,
        signatureDataUrl,
        synced: true,
      };
      await saveInspection(localPayload as any);

      toast({ title: "Inspection saved", description: "Saved to database and locally." });
      navigate("/reports");
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast({ title: "Error", description: "Failed to save inspection." });
    }
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
      <section className="max-w-2xl mx-auto p-4 pb-8">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl">New Inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Vehicle Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registration">Registration *</Label>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input 
                      id="make" 
                      className="h-12"
                      value={vehicle.make} 
                      onChange={(e) => setVehicle((v) => ({ ...v, make: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input 
                      id="model" 
                      className="h-12"
                      value={vehicle.model} 
                      onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input 
                      id="mileage" 
                      type="number" 
                      className="h-12"
                      value={vehicle.mileage} 
                      onChange={(e) => setVehicle((v) => ({ ...v, mileage: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionType">Inspection Type</Label>
                    <select
                      id="inspectionType"
                      className="w-full h-12 rounded-md border bg-background px-3 py-2 text-base"
                      value={inspectionType}
                      onChange={(e) => setInspectionType(e.target.value)}
                    >
                      {config.inspectionTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Driver Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Driver</Label>
                  <div className="flex flex-col gap-3">
                    <DriverSelect 
                      key={driverListVersion} 
                      value={driverId} 
                      onChange={async (id) => {
                        setDriverId(id);
                        if (id) {
                          const allDrivers = await getAllDrivers();
                          const d = allDrivers.find(driver => driver.id === id);
                          setDriverName(d?.name ?? null);
                        } else {
                          setDriverName(null);
                        }
                      }} 
                    />
                    <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full h-12">
                          Add New Driver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle>Add Driver</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input 
                              className="h-12"
                              value={driverForm.name} 
                              onChange={(e) => setDriverForm((f) => ({ ...f, name: e.target.value }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>License</Label>
                            <Input 
                              className="h-12"
                              value={driverForm.license} 
                              onChange={(e) => setDriverForm((f) => ({ ...f, license: e.target.value }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input 
                              className="h-12"
                              value={driverForm.phone} 
                              onChange={(e) => setDriverForm((f) => ({ ...f, phone: e.target.value }))} 
                            />
                          </div>
                        </div>
                        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            onClick={() => setDriverDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="w-full sm:w-auto"
                            onClick={async () => {
                              if (!driverForm.name.trim()) { 
                                toast({ title: "Driver name required" }); 
                                return; 
                              }
                              try {
                                const d = await createDriver({ 
                                  name: driverForm.name.trim(), 
                                  license: driverForm.license || undefined, 
                                  phone: driverForm.phone || undefined 
                                });
                                setDriverId(d.id);
                                setDriverName(d.name);
                                setDriverListVersion((v) => v + 1);
                                setDriverDialogOpen(false);
                                setDriverForm({ name: "", license: "", phone: "" });
                                toast({ title: "Driver added to database" });
                              } catch (error) {
                                console.error("Error adding driver:", error);
                                toast({ title: "Error", description: "Failed to add driver" });
                              }
                            }}
                          >
                            Save Driver
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Inspection Checklist</h3>
              {config.categories.filter((c) => c.id !== "comments").map((category) => (
                <div key={category.id} className="space-y-4">
                  <h4 className="text-base font-medium text-primary">{category.label}</h4>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium leading-relaxed">{item.label}</Label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <ToggleGroup
                              type="single"
                              className="inline-flex w-full sm:w-auto"
                              value={checklist[category.id][item.id].status ?? undefined as any}
                              onValueChange={(val) => updateItem(category.id, item.id, { status: (val as any) || null })}
                            >
                              <ToggleGroupItem 
                                value="pass" 
                                aria-label="Pass"
                                className="flex-1 sm:flex-none h-12 px-6"
                              >
                                Pass
                              </ToggleGroupItem>
                              <ToggleGroupItem 
                                value="fail" 
                                aria-label="Fail"
                                className="flex-1 sm:flex-none h-12 px-6"
                              >
                                Fail
                              </ToggleGroupItem>
                            </ToggleGroup>
                            <Input
                              placeholder="Add comment..."
                              className="h-12 flex-1"
                              value={checklist[category.id][item.id].comment || ""}
                              onChange={(e) => updateItem(category.id, item.id, { comment: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* General Comments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="generalComments">General Comments</Label>
                <Textarea
                  id="generalComments"
                  className="min-h-[120px] resize-none"
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
                  placeholder="Add any additional notes or observations..."
                />
              </div>
            </div>

            {/* Driver Signature */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Driver Signature</h3>
              <div className="space-y-2">
                <Label>Signature</Label>
                <SignatureCanvas value={signatureDataUrl} onChange={setSignatureDataUrl} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6 border-t">
              <Button 
                onClick={onSave} 
                disabled={!allValid}
                className="w-full h-12 text-base font-medium"
              >
                Save Inspection
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button 
                  variant="secondary" 
                  className="h-12"
                  onClick={onExportPDF}
                >
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default InspectionFormScreen;
