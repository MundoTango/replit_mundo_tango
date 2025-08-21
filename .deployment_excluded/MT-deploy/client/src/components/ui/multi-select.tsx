import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: Array<{ value: string; label: string; emoji?: string; description?: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelected?: number;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  maxSelected,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure selected is always an array
  const selectedArray = Array.isArray(selected) ? selected : [];

  const handleUnselect = (item: string) => {
    onChange(selectedArray.filter((i) => i !== item));
  };

  const handleSelect = (item: string) => {
    if (selectedArray.includes(item)) {
      handleUnselect(item);
    } else {
      if (maxSelected && selectedArray.length >= maxSelected) return;
      onChange([...selectedArray, item]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[40px] h-auto p-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedArray.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedArray.map((item) => {
              const option = options.find((opt) => opt.value === item);
              return (
                <Badge
                  variant="secondary"
                  key={item}
                  className="mr-1 mb-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {option?.emoji && <span className="mr-1">{option.emoji}</span>}
                  {option?.label || item}
                  <span
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(item)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              );
            })}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedArray.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <span className="h-4 w-4">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {option.emoji && <span>{option.emoji}</span>}
                      <span>{option.label}</span>
                    </div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}