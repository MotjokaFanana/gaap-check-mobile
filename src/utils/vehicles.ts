import localforage from "localforage";

export interface Vehicle {
  registration: string; // unique key, uppercase
  make: string;
  model: string;
  mileage: number; // last known
  createdAt: string;
  updatedAt: string;
}

const vehicleStore = localforage.createInstance({ name: "gaap-prototype", storeName: "vehicles" });

function normalizeReg(reg: string) {
  return reg.trim().toUpperCase();
}

export async function upsertVehicle(v: { registration: string; make: string; model: string; mileage: number; }) {
  const key = normalizeReg(v.registration);
  const existing = await vehicleStore.getItem<Vehicle>(key);
  const now = new Date().toISOString();
  const toSave: Vehicle = {
    registration: key,
    make: v.make,
    model: v.model,
    mileage: v.mileage,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await vehicleStore.setItem(key, toSave);
  return toSave;
}

export async function setVehicleMileage(registration: string, mileage: number) {
  const key = normalizeReg(registration);
  const v = await vehicleStore.getItem<Vehicle>(key);
  if (!v) return null;
  v.mileage = mileage;
  v.updatedAt = new Date().toISOString();
  await vehicleStore.setItem(key, v);
  return v;
}

export async function getVehicle(registration: string) {
  const key = normalizeReg(registration);
  const v = await vehicleStore.getItem<Vehicle>(key);
  return v ?? null;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const list: Vehicle[] = [];
  await vehicleStore.iterate((val) => list.push(val as Vehicle));
  return list.sort((a, b) => a.registration.localeCompare(b.registration));
}

export async function searchVehicles(query: string): Promise<Vehicle[]> {
  const q = normalizeReg(query);
  if (!q) return listVehicles();
  const all = await listVehicles();
  return all.filter(v => v.registration.includes(q));
}

export async function removeVehicle(registration: string) {
  const key = normalizeReg(registration);
  await vehicleStore.removeItem(key);
}
