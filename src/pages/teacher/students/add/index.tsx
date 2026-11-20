import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import { Form } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import { getAllBatches, type T_Batch } from "@/pages/batch/service/service";
import { createStudent } from "../service/service";
import {
  getStepIndexForField,
  STUDENT_LAST_STEP,
  STUDENT_STEP_FIELDS,
  STUDENT_STEPS,
  createTeacherStudentSchema,
  type CreateTeacherStudentValues,
  type T_STUDENT_STEP,
  type TBatchOption,
} from "./schema";
import { STUDENT_STEP_CONFIG } from "./components/steps";
import FormStepper from "./components/form-stepper";

const DRAFT_KEY = "teacher-add-student-draft";

const DEFAULT_VALUES: CreateTeacherStudentValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  universityRegNo: "",
  gender: "MALE",
  dobBs: "",
  admissionDateBs: "",
  batchId: "",
  phone: "",
  email: "",
  permanentAddress: "",
  temporaryAddress: "",
  guardianRelation: "FATHER",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianOccupation: "",
  guardianAddress: "",
};

/** Restore an in-progress draft (string fields only). */
function readDraft(): Partial<CreateTeacherStudentValues> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const entries = Object.entries(parsed as Record<string, unknown>).filter(
      ([, value]) => typeof value === "string",
    );
    return Object.fromEntries(entries) as Partial<CreateTeacherStudentValues>;
  } catch {
    return {};
  }
}

function toOptional(value: string | undefined) {
  const t = value?.trim();
  return t ? t : undefined;
}

export default function AddStudentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [step, setStep] = useState<T_STUDENT_STEP>(0);
  // Highest validated step: later steps stay unreachable until validated.
  const [maxReached, setMaxReached] = useState<T_STUDENT_STEP>(0);
  const [attemptedStep, setAttemptedStep] = useState<T_STUDENT_STEP | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<T_STUDENT_STEP>(step);

  const [initialValues] = useState<CreateTeacherStudentValues>(() => ({
    ...DEFAULT_VALUES,
    ...readDraft(),
  }));

  const form = useForm<CreateTeacherStudentValues>({
    resolver: zodResolver(createTeacherStudentSchema),
    defaultValues: initialValues,
  });

  // Persist the draft on every change so a refresh does not lose it.
  const watchedValues = useWatch({ control: form.control });
  useEffect(() => {
    if (!watchedValues) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues));
    } catch {
      // Private mode / quota — the draft is only a convenience.
    }
  }, [watchedValues]);

  // Move focus to the step heading whenever the step changes.
  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    headingRef.current?.focus();
  }, [step]);

  const batchQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "teacher-options", "unlimited"],
    queryFn: () => getAllBatches({ page: 1, limit: -1 }),
  });

  const batchOptions: TBatchOption[] = (() => {
    const raw = batchQuery.data as unknown as {
      data?: T_Batch[] | { data?: T_Batch[] };
    };
    const rows: T_Batch[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : [];
    return rows.map((b) => ({
      label: `${b.name}${b.course?.code ? ` (${b.course.code})` : ""}`.trim(),
      value: b.id,
      searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}`,
    }));
  })();

  const mutation = useMutation({
    mutationFn: async (values: CreateTeacherStudentValues) =>
      createStudent({
        firstName: values.firstName.trim(),
        middleName: toOptional(values.middleName),
        lastName: values.lastName.trim(),
        universityRegNo: values.universityRegNo.trim(),
        gender: values.gender,
        dobBs: toOptional(values.dobBs),
        admissionDateBs: values.admissionDateBs,
        batchId: values.batchId,
        phone: toOptional(values.phone),
        email: toOptional(values.email),
        permanentAddress: toOptional(values.permanentAddress),
        temporaryAddress: toOptional(values.temporaryAddress),
        guardian: {
          relation: values.guardianRelation,
          fullName: values.guardianName.trim(),
          phone: toOptional(values.guardianPhone),
          email: toOptional(values.guardianEmail),
          occupation: toOptional(values.guardianOccupation),
          address: toOptional(values.guardianAddress),
        },
      }),
    onSuccess: () => {
      sessionStorage.removeItem(DRAFT_KEY);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_STUDENTS] });
      toast.success("Student added — pending approval.");
      navigate("/teacher/students");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      // If the API reported field-level errors, jump to the step that owns
      // the first one so it is visible on screen.
      const serverErrorData: unknown = error.response?.data?.data;
      if (serverErrorData && typeof serverErrorData === "object") {
        const errorStep = Object.keys(serverErrorData as Record<string, unknown>)
          .filter((field) => field !== "_deepErrors")
          .map((field) => getStepIndexForField(field))
          .find((stepIndex) => stepIndex !== undefined);
        if (errorStep !== undefined) {
          setStep(errorStep);
          setMaxReached((prev) => (errorStep > prev ? errorStep : prev));
        }
      }
      toast.error(error.response?.data?.message ?? "Failed to add student.");
    },
  });

  const isLastStep = step === STUDENT_LAST_STEP;
  const currentMeta = STUDENT_STEP_CONFIG[step];
  const CurrentStep = currentMeta.component;

  const goNext = async () => {
    if (isLastStep) return;
    const valid = await form.trigger([...STUDENT_STEP_FIELDS[step]], {
      shouldFocus: true,
    });
    if (!valid) {
      setAttemptedStep(step);
      return;
    }
    const next = (step + 1) as T_STUDENT_STEP;
    setAttemptedStep(null);
    setStep(next);
    setMaxReached((prev) => (next > prev ? next : prev));
  };

  const goBack = () => {
    if (step === 0) return;
    setAttemptedStep(null);
    setStep((step - 1) as T_STUDENT_STEP);
  };

  /** Stepper jump: forward needs the current step valid, back is free. */
  const goToStep = async (target: T_STUDENT_STEP) => {
    if (target === step || mutation.isPending) return;
    if (target < step) {
      setAttemptedStep(null);
      setStep(target);
      return;
    }
    const valid = await form.trigger([...STUDENT_STEP_FIELDS[step]], {
      shouldFocus: true,
    });
    if (!valid) {
      setAttemptedStep(step);
      return;
    }
    setAttemptedStep(null);
    setStep(target);
    setMaxReached((prev) => (target > prev ? target : prev));
  };

  const submit = form.handleSubmit(
    (values) => {
      if (!isLastStep) return;
      mutation.mutate(values);
    },
    (errors: FieldErrors<CreateTeacherStudentValues>) => {
      // Full validation failed: jump to the step holding the first error.
      const firstStep = ([0, 1, 2, 3] as const).find((stepIndex) =>
        STUDENT_STEP_FIELDS[stepIndex].some((field) => Boolean(errors[field])),
      );
      if (firstStep !== undefined) {
        setStep(firstStep);
        setAttemptedStep(firstStep);
      }
    },
  );

  // Enter on steps 1-4 advances the wizard instead of submitting the form.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest("button, textarea, [role='combobox']")) return;
    event.preventDefault();
    if (isLastStep) {
      void submit();
    } else {
      void goNext();
    }
  };

  const handleCancel = () => {
    if (
      form.formState.isDirty &&
      !window.confirm("Discard the details you entered?")
    ) {
      return;
    }
    sessionStorage.removeItem(DRAFT_KEY);
    navigate("/teacher/students");
  };

  // Errors visible on the step the user just tried to leave.
  const stepErrors = STUDENT_STEP_FIELDS[step]
    .map((field) => form.formState.errors[field])
    .filter((error) => Boolean(error));
  const firstErrorMessage = stepErrors[0]?.message;
  const showErrorSummary = attemptedStep === step && stepErrors.length > 0;

  return (
    <div className="space-y-4 p-5">
      <PageHeader
        title="Add Student"
        description="While pending or rejected you can edit. The student is not available in attendance, fees, exams, or results until approved."
        backPage="/teacher/students"
        backPageTitle="Back to Students"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher/students" },
          { title: "Students", link: "/teacher/students" },
          { title: "Add" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <FormStepper
          currentStep={step}
          maxReached={maxReached}
          onStepClick={(target) => void goToStep(target)}
        />
        <p className="hidden shrink-0 text-sm text-muted-foreground lg:block">
          Step {step + 1} of {STUDENT_STEPS.length}
        </p>
      </div>

      <Form {...form}>
        <form
          noValidate
          onKeyDown={handleKeyDown}
          onSubmit={submit}
          className="space-y-4"
        >
          <div key={step} className="animate-in fade-in-0 space-y-4 duration-200">
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {currentMeta.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentMeta.description}
              </p>
            </div>

            {showErrorSummary ? (
              <p role="alert" className="text-sm text-destructive">
                {stepErrors.length === 1
                  ? "1 field needs attention"
                  : `${stepErrors.length} fields need attention`}
                {typeof firstErrorMessage === "string"
                  ? `: ${firstErrorMessage}`
                  : "."}
              </p>
            ) : null}

            <CurrentStep
              form={form}
              batchOptions={batchOptions}
              batchLoading={batchQuery.isLoading}
              onEditStep={(target) => void goToStep(target)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <div className="flex justify-end gap-2">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={mutation.isPending}
                >
                  Back
                </Button>
              ) : null}
              {isLastStep ? (
                <Button
                  type="submit"
                  variant="primary"
                  loading={mutation.isPending}
                >
                  Add Student
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void goNext()}
                  disabled={mutation.isPending}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
