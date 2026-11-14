"use client";

import { useState } from "react";
import Button  from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface DatePickerProps {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const today = new Date();
  const defaultDate: DateRange = {
    from: today,
    to: addDays(today, 1),
  };

  const [date, setDate] = useState<DateRange | undefined>(value || defaultDate);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Keep the internal range in sync with the controlled `value` prop by
  // adjusting state during render (no effect needed).
  const [prevValue, setPrevValue] = useState<DateRange | undefined>(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (value) setDate(value);
  }

  const handleSelect = (selected: DateRange | undefined) => {
    setDate(selected);
    onChange?.(selected);
  };

  const handleApply = () => {
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setDate(defaultDate);
    onChange?.(defaultDate);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          mode="input"
          className="w-62.5 justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder || "Pick a date range"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
