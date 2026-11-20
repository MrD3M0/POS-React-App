import {
  STUDENT_FIELD_LABELS,
  STUDENT_STEP_FIELDS,
  STUDENT_STEPS,
  formatStudentFieldValue,
  type AddStudentStepProps,
  type T_STUDENT_STEP,
} from "../schema";

/** Steps summarised on the review screen (the review step itself excluded). */
const REVIEW_STEPS: readonly T_STUDENT_STEP[] = [0, 1, 2, 3];

/** Step 5 — read-only summary of everything entered, with per-step Edit. */
export default function StepReview({
  form,
  batchOptions,
  onEditStep,
}: AddStudentStepProps) {
  const values = form.getValues();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {REVIEW_STEPS.map((stepIndex) => {
        const step = STUDENT_STEPS[stepIndex];
        return (
          <section key={step.id} className="rounded-lg border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
              <h3 className="text-sm font-medium">{step.title}</h3>
              <button
                type="button"
                onClick={() => onEditStep(stepIndex)}
                aria-label={`Edit ${step.title}`}
                className="cursor-pointer rounded-sm text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-1 px-4 py-3">
              {STUDENT_STEP_FIELDS[stepIndex].map((field) => (
                <div
                  key={field}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <dt className="shrink-0 text-muted-foreground">
                    {STUDENT_FIELD_LABELS[field]}
                  </dt>
                  <dd className="min-w-0 text-right break-words">
                    {formatStudentFieldValue(field, values[field], batchOptions)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
