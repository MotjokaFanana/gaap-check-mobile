import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllDrivers, type Driver } from "@/utils/database";

interface Props {
  value: string | null;
  onChange: (driverId: string | null) => void;
}

const DriverSelect = ({ value, onChange }: Props) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllDrivers();
        setDrivers(list);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    })();
  }, []);

  return (
    <Select value={value ?? undefined} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder="Select a driver" />
      </SelectTrigger>
      <SelectContent className="z-[100] bg-popover">
        {drivers.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No drivers yet</div>
        ) : (
          drivers.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default DriverSelect;
