"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface Option {
  id: string;
  name: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.id));

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const removeOption = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[44px]">
        {selectedOptions.length === 0 ? (
          <div className="w-full flex items-center h-11 px-3 border border-input rounded-md text-sm text-muted-foreground bg-background/50 italic">
            {placeholder}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-1.5 w-full border border-input rounded-md bg-background/50">
            {selectedOptions.map((opt) => (
              <Badge
                key={opt.id}
                variant="secondary"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none pl-2.5 pr-1 py-1 gap-1 text-xs font-medium animate-in zoom-in-95 duration-200"
              >
                {opt.name}
                <button
                  type="button"
                  className="rounded-full outline-none hover:bg-blue-200 p-0.5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(opt.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-11 bg-background shadow-none border-input hover:bg-background/80"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="truncate text-sm font-normal">
          {searchTerm ? `Searching: ${searchTerm}` : "Add tags..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-[100px] left-0 z-[100] w-full max-h-72 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center border-b px-3 bg-muted/30">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              className="flex h-11 w-full border-none bg-transparent py-3 text-sm outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2.5 text-sm transition-all outline-none",
                    value.includes(option.id)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "hover:bg-muted/60 text-foreground",
                  )}
                  onClick={() => {
                    toggleOption(option.id);
                    // Keep open for multi-select
                  }}
                  type="button"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 transition-all",
                      value.includes(option.id)
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75",
                    )}
                  />
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
