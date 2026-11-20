import type { ComponentType } from "react";
import {
  STUDENT_STEP_FIELDS,
  STUDENT_STEPS,
  type AddStudentStepProps,
  type CreateTeacherStudentValues,
  type T_STUDENT_STEP,
} from "../schema";
import StepPersonal from "./step-personal";
import StepAcademic from "./step-academic";
import StepContact from "./step-contact";
import StepGuardian from "./step-guardian";
import StepReview from "./step-review";

export type TStudentStepConfig = {
  id: string;
  title: string;
  description: string;
  fields: readonly (keyof CreateTeacherStudentValues)[];
  component: ComponentType<AddStudentStepProps>;
};

/** One component per step, in step order. */
const STEP_COMPONENTS: readonly ComponentType<AddStudentStepProps>[] = [
  StepPersonal,
  StepAcademic,
  StepContact,
  StepGuardian,
  StepReview,
];

/** The single source of truth for the wizard steps. */
export const STUDENT_STEP_CONFIG: readonly TStudentStepConfig[] =
  STUDENT_STEPS.map((step, index) => {
    const stepIndex = index as T_STUDENT_STEP;
    return {
      ...step,
      fields: STUDENT_STEP_FIELDS[stepIndex],
      component: STEP_COMPONENTS[stepIndex],
    };
  });
