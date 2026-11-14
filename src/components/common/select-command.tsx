import { type FC, type ReactNode, useMemo, useState } from "react";
import { Check, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button  from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};

interface Option {
  label: string;
  value: string;
  searchValues?: string;
  disabled?: boolean;
  disabledTooltipContent?: string | ReactNode;
  icon?: ReactNode;
}

interface SelectCommandProps {
  onChange?: (value: string) => void;
  options?: Option[];
  value?: string;
  disabled?: boolean;
  selectAsDialog?: boolean;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  withClear?: boolean;
  "aria-invalid"?: boolean;
  loading?: boolean;
}

const SelectCommand: FC<SelectCommandProps> = ({
  options = [],
  onChange,
  value,
  disabled = false,
  selectAsDialog = false,
  className,
  placeholder,
  searchPlaceholder,
  hideSearch,
  withClear = false,
  loading = false,
  "aria-invalid": ariaInvalid,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [prevValue, setPrevValue] = useState(value);
  const [mobile] = useState(() => isMobile());
  const [search, setSearch] = useState("");

  // Keep internal selection in sync with the controlled `value` prop by
  // adjusting state during render (no effect needed).
  if (prevValue !== value) {
    setPrevValue(value);
    setSelectedValue(value || "");
  }

  const handleSelect = (val: string) => {
    if (disabled) return;
    setSelectedValue(val);
    onChange?.(val);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSearch("");
  };

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const term = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.searchValues && opt.searchValues.toLowerCase().includes(term)),
    );
  }, [options, search]);

  if (mobile || selectAsDialog) {
    return (
      <>
        <div className="relative">
          <Button
            onClick={() => !disabled && setOpen(true)}
            disabled={disabled || loading}
            className={cn(
              "justify-between cursor-pointer w-full h-10 caret-transparent disabled",
              (withClear || loading) && selectedValue && "[&_svg]:hidden",
              className,
              ariaInvalid && "border border-destructive",
            )}
            value={options.find((opt) => opt.value === selectedValue)?.label}
            variant={"outline"}
            type="button"
          >
            {options.find((opt) => opt.value === selectedValue)?.label || (
              <span className="text-muted-foreground">
                {" "}
                {placeholder ?? "Select an option"}{" "}
              </span>
            )}
          </Button>
          {withClear && !loading && selectedValue && (
            <X
              className="absolute top-2.5 right-2 h-5 w-5 z-50 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedValue("");
                onChange?.("");
              }}
            />
          )}
          {loading && (
            <Loader2 className="animate-spin absolute top-2.5 right-2 h-5 w-5 z-50 cursor-pointer" />
          )}
        </div>

        <CommandDialog open={open} onOpenChange={handleOpenChange}>
          <Command shouldFilter={false}>
            {!hideSearch && (
              <CommandInput
                placeholder={searchPlaceholder ?? "Search..."}
                className="h-9"
                value={search}
                onValueChange={setSearch}
              />
            )}
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((item) => (
                    <CommandItem
                      key={item.value}
                      onSelect={() => handleSelect(item.value)}
                      className={cn(
                        "hover:bg-accent",
                        selectedValue === item.value && "bg-accent",
                      )}
                      disabled={item.disabled}
                    >
                      {item.icon}
                      {item.label}{" "}
                      {item.searchValues && (
                        <span className="opacity-0">{item.searchValues}</span>
                      )}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedValue === item.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {item.disabledTooltipContent && item.disabled && (
                        <Tooltip>
                          <TooltipTrigger>
                            <TriangleAlert />
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.disabledTooltipContent}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      </>
    );
  }

  return (
    <Select open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <SelectTrigger
          disabled={disabled || loading}
          className={cn(
            "truncate h-10 text-sm cursor-pointer",
            (withClear || loading) &&
              selectedValue &&
              "[&_svg.lucide-chevron-down]:hidden",
            className,
          )}
        >
          <div
            role="combobox"
            className={cn(
              "flex justify-between text-accent-foreground w-full ",
              className,
            )}
          >
            {options.find((option) => option.value === selectedValue)
              ?.label || (
              <span className="text-muted-foreground">
                {" "}
                {placeholder ?? "Select an option"}{" "}
              </span>
            )}
          </div>
        </SelectTrigger>
        {withClear && !loading && selectedValue && (
          <X
            className="absolute top-3 right-3 h-4 w-4 z-50 cursor-pointer hover:text-muted-foreground transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedValue("");
              onChange?.("");
            }}
          />
        )}
        {loading && (
          <Loader2 className="absolute top-3 right-3 h-4 w-4 z-50 cursor-pointer hover:text-muted-foreground transition-all animate-spin" />
        )}
      </div>

      <SelectContent
        className="p-0 data-[side=top]:animate-slide-up data-[side=bottom]:animate-slide-down"
        position="popper"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
      >
        <Command shouldFilter={false}>
          {!hideSearch && (
            <CommandInput
              placeholder={searchPlaceholder ?? "Search..."}
              className="h-9"
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList>
            {filteredOptions.length === 0 ? (
              <CommandEmpty>No items found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((item) => (
                  <div className="relative" key={item.value}>
                    <CommandItem
                      key={item.value}
                      onSelect={() => handleSelect(item.value)}
                      className={cn(
                        "hover:bg-accent cursor-pointer",
                        selectedValue === item.value && "bg-accent",
                      )}
                      disabled={item.disabled}
                    >
                      {item.icon}
                      {item.label}{" "}
                      {item.searchValues && (
                        <span className="opacity-0">{item.searchValues}</span>
                      )}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedValue === item.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                    <div className="absolute top-2 right-1">
                      {item.disabledTooltipContent && item.disabled && (
                        <Tooltip>
                          <TooltipTrigger>
                            <TriangleAlert size={15} />
                          </TooltipTrigger>
                          <TooltipContent align="end">
                            {item.disabledTooltipContent}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </SelectContent>
    </Select>
  );
};

export default SelectCommand;
