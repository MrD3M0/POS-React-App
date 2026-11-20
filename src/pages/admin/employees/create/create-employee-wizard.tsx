import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import { Form } from "@/components/form";
import {
  EMPLOYEE_CREATE_SCHEMA,
  EMPLOYEE_LAST_STEP,
  EMPLOYEE_STEP_FIELDS,
  EMPLOYEE_STEPS,
  getStepIndexForField,
  type T_EMPLOYEE_CREATE,
  type T_EMPLOYEE_STEP,
} from "./employee.schema";
import { createEmployee, type T_EMPLOYEE_ROLE } from "../service/service";
import EmployeeStepper from "./employee-stepper";
import PersonalInfoStep from "./personal-info-step";
import EmploymentStep from "./employment-step";
import BankReviewStep from "./bank-review-step";

function toOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function CreateEmployeeWizard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState<T_EMPLOYEE_STEP>(0);

  const form = useForm<T_EMPLOYEE_CREATE>({
    resolver: zodResolver(EMPLOYEE_CREATE_SCHEMA),
    defaultValues: {
      employeeCode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      role: "TEACHER",
      dobBs: "",
      phone: "",
      email: "",
      password: "",
      permanentAddress: "",
      temporaryAddress: "",
      designation: "Teacher",
      joinDateBs: "",
      panNo: "",
      ssfNo: "",
      bankName: "",
      bankAccountNo: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: T_EMPLOYEE_CREATE) =>
      createEmployee({ ...createEmployeePayload(data), role: data.role as T_EMPLOYEE_ROLE }),
    onSuccess: () => {
      toast.success("Employee created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST] });
      navigate("/admin/employees");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      // Jump to the step that owns the first invalid field reported by the API
      // (e.g. duplicate Employee Code / Email), so the error is visible there.
      const serverErrorData: unknown = error.response?.data?.data;
      if (serverErrorData && typeof serverErrorData === "object") {
        const errorStep = Object.keys(serverErrorData as Record<string, unknown>)
          .map((field) => getStepIndexForField(field))
          .find((stepIndex) => stepIndex !== undefined);
        if (errorStep !== undefined) setStep(errorStep);
      }
      toast.error(error.response?.data?.message ?? "Failed to create employee.");
    },
  });

  const isLastStep = step === EMPLOYEE_LAST_STEP;
  const currentStepFields = EMPLOYEE_STEP_FIELDS[step];

  const goNext = async () => {
    // Validate only the current step's fields; focus the first invalid one.
    const valid = await form.trigger([...currentStepFields], { shouldFocus: true });
    if (!valid) return;
    setStep((prev) => Math.min(prev + 1, EMPLOYEE_LAST_STEP) as T_EMPLOYEE_STEP);
  };

  // Back never validates; entered data stays in the single form instance.
  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 0) as T_EMPLOYEE_STEP);
  };

  const onSubmit = (data: T_EMPLOYEE_CREATE) => {
    mutation.mutate(data);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.tagName === "TEXTAREA") return;
    // Enter on a step triggers Next (not submit), except on the last step.
    event.preventDefault();
    if (isLastStep) {
      void form.handleSubmit(onSubmit)();
    } else {
      void goNext();
    }
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Create Employee"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Employees", link: "/admin/employees" },
          { title: "Create", link: "/admin/employees/create" },
        ]}
        backPage="/admin/employees"
      />

      <div className="w-full mt-4">
        <div className="flex items-center justify-between gap-4">
          <EmployeeStepper
            steps={EMPLOYEE_STEPS}
            currentStep={step}
            onStepClick={(target) => {
              if (mutation.isPending) return;
              setStep(target);
            }}
          />
          <p className="shrink-0 text-sm text-muted-foreground">
            Step {step + 1} of {EMPLOYEE_STEPS.length}
          </p>
        </div>

        <div className="pt-6">
          <Form {...form}>
            <form
              noValidate
              onKeyDown={handleKeyDown}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Fade-only transition between steps */}
              <div key={step} className="animate-in fade-in-0 duration-200">
                {step === 0 ? <PersonalInfoStep form={form} /> : null}
                {step === 1 ? <EmploymentStep form={form} /> : null}
                {step === EMPLOYEE_LAST_STEP ? (
                  <BankReviewStep form={form} onEditStep={setStep} />
                ) : null}
              </div>

              {/* Sticky footer: Cancel left, Back + Next/Create right */}
              <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t bg-background px-1 py-4">
                <Link to="/admin/employees">
                  <Button type="button" variant="secondary" disabled={mutation.isPending}>
                    Cancel
                  </Button>
                </Link>
                <div className="flex gap-3">
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
                    <Button type="submit" loading={mutation.isPending}>
                      Create Employee
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => void goNext()}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

/** Same payload shape as the old single-page form. */
function createEmployeePayload(data: T_EMPLOYEE_CREATE) {
  return {
    employeeCode: data.employeeCode.trim(),
    firstName: data.firstName.trim(),
    middleName: toOptional(data.middleName),
    lastName: data.lastName.trim(),
    gender: data.gender,
    role: data.role,
    dobBs: toOptional(data.dobBs),
    phone: toOptional(data.phone),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    permanentAddress: toOptional(data.permanentAddress),
    temporaryAddress: toOptional(data.temporaryAddress),
    designation: data.designation.trim(),
    joinDateBs: data.joinDateBs,
    panNo: toOptional(data.panNo),
    ssfNo: toOptional(data.ssfNo),
    bankName: toOptional(data.bankName),
    bankAccountNo: toOptional(data.bankAccountNo),
  };
}
