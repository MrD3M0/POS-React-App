import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { T_EMPLOYEE_STEP } from "./employee.schema";

type EmployeeStepperProps = {
  steps: readonly { readonly label: string }[];
  currentStep: T_EMPLOYEE_STEP;
  onStepClick: (step: T_EMPLOYEE_STEP) => void;
};

export default function EmployeeStepper({
  steps,
  currentStep,
  onStepClick,
}: EmployeeStepperProps) {
  return (
    <ol className="flex w-full items-center" aria-label="Create employee steps">
      {steps.map((step, index) => {
        const stepIndex = index as T_EMPLOYEE_STEP;
        const isCurrent = stepIndex === currentStep;
        const isCompleted = stepIndex < currentStep;
        const isClickable = isCompleted;

        return (
          <li
            key={step.label}
            className={cn("flex items-center", index < steps.length - 1 && "flex-1")}
          >
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(stepIndex)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "group flex items-center gap-2 rounded-md px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isClickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted &&
                    "border-primary/40 bg-primary/10 text-primary group-hover:bg-primary/20",
                  !isCurrent && !isCompleted && "border-border bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  isCurrent && "font-medium text-foreground",
                  isCompleted && "text-foreground/80",
                  !isCurrent && !isCompleted && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  stepIndex < currentStep ? "bg-primary/40" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
