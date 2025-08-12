import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { searchVehicles, type Vehicle } from "@/utils/vehicles";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelectVehicle: (v: Vehicle) => void;
}

const VehicleAutoComplete = ({ value, onChange, onSelectVehicle }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Vehicle[]>([]);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const list = await searchVehicles(query);
      if (!ignore) setResults(list);
    })();
    return () => { ignore = true; };
  }, [query]);

  const showList = useMemo(() => open && results.length > 0, [open, results]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={value}
          onChange={(e) => { onChange(e.target.value.toUpperCase()); setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Type registration..."
        />
      </PopoverTrigger>
      <PopoverContent className="p-0 z-[100] bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Search registration" value={query} onValueChange={(v) => setQuery(v)} />
          <CommandList>
            <CommandEmpty>No vehicles found.</CommandEmpty>
            <CommandGroup>
              {results.map((v) => (
                <CommandItem key={v.registration} value={v.registration}
                  onSelect={() => { onSelectVehicle(v); setOpen(false); }}>
                  <div className="flex w-full items-center gap-2">
                    <span className="font-medium">{v.registration}</span>
                    <span className="text-muted-foreground text-xs">{v.make} {v.model}</span>
                    <span className="ml-auto text-xs">{v.mileage} km</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VehicleAutoComplete;
