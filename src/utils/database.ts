import { supabase } from "@/integrations/supabase/client";

// Database interfaces based on current schema
export interface Inspection {
  id: string;
  created_at: string;
  updated_at: string;
  inspection_type: string;
  vehicle_registration: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_mileage: number;
  checklist: any;
  general_comments?: string;
  inspector_name?: string;
  driver_id?: string;
  driver_name?: string;
  signature_data_url?: string;
  synced: boolean;
  user_id: string;
}

export interface Vehicle {
  registration: string;
  make: string;
  model: string;
  mileage: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  license?: string;
  phone?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Database helper functions

// Inspection functions
export async function getAllInspections(): Promise<Inspection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    // Try using table name directly - the types are outdated
    const { data, error } = await (supabase as any)
      .from("inspections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return [];
  }
}

export async function deleteInspection(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await (supabase as any)
    .from("inspections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// Vehicle functions
export async function getAllVehicles(): Promise<Vehicle[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await (supabase as any)
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("registration");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

export async function createVehicle(vehicleData: {
  registration: string;
  make: string;
  model: string;
  mileage: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await (supabase as any)
    .from("vehicles")
    .insert({
      registration: vehicleData.registration.toUpperCase(),
      make: vehicleData.make,
      model: vehicleData.model,
      mileage: vehicleData.mileage,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicle(registration: string, vehicleData: {
  make: string;
  model: string;
  mileage: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await (supabase as any)
    .from("vehicles")
    .update({
      make: vehicleData.make,
      model: vehicleData.model,
      mileage: vehicleData.mileage,
    })
    .eq("registration", registration.toUpperCase())
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVehicle(registration: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await (supabase as any)
    .from("vehicles")
    .delete()
    .eq("registration", registration.toUpperCase())
    .eq("user_id", user.id);

  if (error) throw error;
}

// Driver functions
export async function getAllDrivers(): Promise<Driver[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await (supabase as any)
      .from("drivers")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}