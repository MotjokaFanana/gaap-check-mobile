import localforage from "localforage";

export interface Driver {
  id: string; // uuid string
  name: string;
  license?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

const store = localforage.createInstance({ name: "gaap-prototype", storeName: "drivers" });

export async function addDriver(d: { name: string; license?: string; phone?: string; }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: Driver = { id, name: d.name, license: d.license, phone: d.phone, createdAt: now, updatedAt: now };
  await store.setItem(id, record);
  return record;
}

export async function listDrivers(): Promise<Driver[]> {
  const res: Driver[] = [];
  await store.iterate((val) => res.push(val as Driver));
  return res.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDriver(id: string) {
  const d = await store.getItem<Driver>(id);
  return d ?? null;
}

export async function removeDriver(id: string) {
  await store.removeItem(id);
}
