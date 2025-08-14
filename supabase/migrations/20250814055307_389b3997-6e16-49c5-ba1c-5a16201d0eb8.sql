-- Update RLS policies to allow all users to see all vehicles and drivers

-- Drop existing restrictive policies for vehicles
DROP POLICY IF EXISTS "Users can select their vehicles" ON public.vehicles;

-- Create new policy allowing all authenticated users to see all vehicles
CREATE POLICY "All users can view all vehicles" 
ON public.vehicles 
FOR SELECT 
TO authenticated
USING (true);

-- Drop existing restrictive policies for drivers  
DROP POLICY IF EXISTS "Users can select their drivers" ON public.drivers;

-- Create new policy allowing all authenticated users to see all drivers
CREATE POLICY "All users can view all drivers" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (true);