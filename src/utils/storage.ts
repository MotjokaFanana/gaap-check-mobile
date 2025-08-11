import localforage from "localforage";

export interface StoredInspection {
  id: string;
  createdAt: string;
  inspectionType: string;
  vehicle: { make: string; model: string; registration: string; mileage: string };
  checklist: Record<string, Record<string, { status: "pass" | "fail" | null; comment?: string }>>;
  generalComments?: string;
  synced?: boolean;
}

const store = localforage.createInstance({ name: "gaap-prototype", storeName: "inspections" });

export async function saveInspection(inspection: StoredInspection) {
  await store.setItem(inspection.id, inspection);
}

export async function getAllInspections(): Promise<StoredInspection[]> {
  const items: StoredInspection[] = [];
  await store.iterate((value) => {
    items.push(value as StoredInspection);
  });
  return items;
}

export async function getInspection(id: string): Promise<StoredInspection | null> {
  const v = await store.getItem<StoredInspection>(id);
  return v ?? null;
}

export async function deleteInspection(id: string) {
  await store.removeItem(id);
}

export async function markSynced(id: string) {
  const item = await getInspection(id);
  if (item) {
    item.synced = true;
    await saveInspection(item);
  }
}
