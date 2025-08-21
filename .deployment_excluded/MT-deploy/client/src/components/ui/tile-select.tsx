import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TileOption {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

interface TileSelectProps {
  options: TileOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelected?: number;
  columns?: number;
}

export function TileSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  maxSelected,
  columns = 3,
}: TileSelectProps) {
  // Ensure selected is always an array
  const selectedArray = Array.isArray(selected) ? selected : [];

  const handleToggle = (value: string) => {
    if (selectedArray.includes(value)) {
      onChange(selectedArray.filter((item) => item !== value));
    } else {
      if (maxSelected && selectedArray.length >= maxSelected) return;
      // For single selection, replace the current selection
      if (maxSelected === 1) {
        onChange([value]);
      } else {
        onChange([...selectedArray, value]);
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {selectedArray.length === 0 && (
        <p className="text-sm text-gray-500 italic">{placeholder}</p>
      )}
      
      <div 
        className={cn(
          "grid gap-3",
          columns === 2 && "grid-cols-1 sm:grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {options.map((option) => {
          const isSelected = selectedArray.includes(option.value);
          const isDisabled = Boolean(maxSelected && !isSelected && selectedArray.length >= maxSelected);
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              disabled={isDisabled}
              className={cn(
                "relative p-4 border-2 rounded-xl text-left transition-all duration-200 group",
                "hover:scale-105 hover:shadow-lg active:scale-95",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50",
                isDisabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 group-hover:border-blue-400"
              )}>
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              
              {/* Content */}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-1">
                  {option.emoji && (
                    <span className="text-lg group-hover:animate-bounce">{option.emoji}</span>
                  )}
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                {option.description && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>
              
              {/* Hover effect overlay */}
              <div className={cn(
                "absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none",
                "bg-gradient-to-br from-blue-400/0 to-purple-400/0",
                "group-hover:from-blue-400/5 group-hover:to-purple-400/5",
                isSelected && "from-blue-400/10 to-purple-400/10"
              )} />
            </button>
          );
        })}
      </div>
      
      {/* Selection counter */}
      {maxSelected && (
        <p className="text-xs text-gray-500 text-center">
          {selectedArray.length} of {maxSelected} selected
        </p>
      )}
    </div>
  );
}