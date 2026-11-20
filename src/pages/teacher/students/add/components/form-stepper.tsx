import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_STEPS, type T_STUDENT_STEP } from "../schema";

type FormStepperProps = {
  currentStep: T_STUDENT_STEP;
  /** Highest step the user has already validated. */
  maxReached: T_STUDENT_STEP;
  onStepClick: (step: T_STUDENT_STEP) => void;
};

/**
 * Wizard progress indicator.
 * - sm+ : numbered steps with titles (completed steps clickable).
 * - mobile: "Step 2 of 5 — Academic Info" plus a progress bar.
 */
export default function FormStepper({
  currentStep,
  maxReached,
  onStepClick,
}: FormStepperProps) {
  const total = STUDENT_STEPS.length;
  const current = STUDENT_STEPS[currentStep];

  return (
    <>
      {/* Desktop / tablet */}
      <ol
        className="hidden w-full items-center sm:flex"
        aria-label="Add student steps"
      >
        {STUDENT_STEPS.map((step, index) => {
          const stepIndex = index as T_STUDENT_STEP;
          const isCurrent = stepIndex === currentStep;
          const isCompleted = stepIndex < currentStep;
          const isReachable = stepIndex <= maxReached && !isCurrent;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < total - 1 && "flex-1",
              )}
            >
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(stepIndex)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isReachable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isCompleted &&
                      "border-primary/40 bg-primary/10 text-primary group-hover:bg-primary/20",
                    !isCurrent &&
                      !isCompleted &&
                      "border-border bg-muted text-muted-foreground",
                    !isCurrent &&
                      !isCompleted &&
                      stepIndex <= maxReached &&
                      "border-primary/40 text-primary",
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-sm md:inline",
                    isCurrent && "font-medium text-foreground",
                    isCompleted && "text-foreground/80",
                    !isCurrent && !isCompleted && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </button>

              {index < total - 1 ? (
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

      {/* Mobile */}
      <div className="sm:hidden">
        <p className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {total} — {current.title}
        </p>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={currentStep + 1}
          aria-label="Add student progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${((currentStep + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
