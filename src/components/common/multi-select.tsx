import { useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface T_MultiSelectOption {
  label: string;
  value: string;
  description?: string;
}

interface MultiSelectProps {
  options: T_MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Multi select built on the shared Command + Popover primitives. Used by the
 * notice audience picker (roles and classes).
 */
export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  disabled = false,
  loading = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = value.filter((v) => options.some((o) => o.value === v));

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              "h-10 w-full cursor-pointer justify-between font-normal",
              className,
            )}
          >
            <span className="min-w-0 truncate">
              {selected.length === 0
                ? placeholder
                : selected
                    .map(
                      (v) => options.find((o) => o.value === v)?.label ?? v,
                    )
                    .join(", ")}
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        {loading ? (
          <Loader2 className="absolute top-2.5 right-2.5 size-4 animate-spin text-muted-foreground" />
        ) : selected.length > 0 && !loading ? (
          <X
            className="absolute top-2.5 right-2.5 z-10 size-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange([]);
            }}
          />
        ) : null}
      </div>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggle(option.value)}
                  className="cursor-pointer gap-2"
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    className="pointer-events-none"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{option.label}</span>
                    {option.description ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {value.includes(option.value) ? (
                    <Check className="ml-auto size-4" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
