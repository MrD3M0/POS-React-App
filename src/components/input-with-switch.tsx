import type { ComponentProps, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Props = Omit<
  ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "type" | "readOnly"
> & {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Text shown inside the input for each state. */
  labels?: { on: string; off: string };
};

/**
 * A read-only text input that mirrors a boolean, with a switch on its right.
 * Click anywhere on it (or press Space / Enter) to toggle.
 *
 * Extra props (id, name, onBlur, aria-*, ref ...) go to the <Input>, so it
 * works inside react-hook-form's <FormControl>.
 */
export const InputWithSwitch = ({
  value,
  onChange,
  labels = { on: "Yes", off: "No" },
  disabled,
  className,
  onClick,
  onKeyDown,
  ...props
}: Props) => {
  const toggle = () => {
    if (!disabled) onChange(!value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === " " || e.key === "Enter") {
      // Enter would otherwise submit the surrounding form.
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        readOnly
        disabled={disabled}
        value={value ? labels.on : labels.off}
        onClick={(e) => {
          onClick?.(e);
          toggle();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          // `readOnly` normally greys the field out; this one is interactive.
          "pr-14 caret-transparent select-none [&[readonly]]:cursor-pointer [&[readonly]]:bg-background",
          value && "border-primary/80 [&[readonly]]:bg-primary/10",
          disabled && "[&[readonly]]:cursor-not-allowed",
          className,
        )}
      />
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        // The input is the keyboard target; keep the tab order to one stop.
        tabIndex={-1}
        aria-label={value ? labels.on : labels.off}
        className="absolute top-1/2 right-3 -translate-y-1/2"
      />
    </div>
  );
};
