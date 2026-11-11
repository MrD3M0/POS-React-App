/**
 * Human-readable labels for subject / teaching-assignment references.
 *
 * Several API payloads only carry IDs (`teachingAssignmentId`,
 * `batchTermSubjectId`). Use these helpers to render a meaningful title while
 * keeping the raw ID as the option value in the form controls.
 */

export type T_EmployeeLike =
  | {
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      employeeCode?: string | null;
    }
  | null
  | undefined;

export type T_BatchTermLike =
  | {
      name?: string | null;
      termNumber?: number | null;
      batch?: { name?: string | null } | null;
    }
  | null
  | undefined;

export type T_SubjectLike =
  { name?: string | null; code?: string | null } | null | undefined;

export type T_TeachingAssignmentLike =
  | {
      teacher?: { employee?: T_EmployeeLike } | null;
      batchTermSubject?: {
        subject?: T_SubjectLike;
        batchTerm?: T_BatchTermLike;
      } | null;
    }
  | null
  | undefined;

export function personName(employee: T_EmployeeLike): string {
  if (!employee) return "";
  const name = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  return name || employee.employeeCode || "";
}

export function subjectLabel(subject: T_SubjectLike): string {
  return subject?.name || subject?.code || "";
}

export function classNameLabel(batchTerm: T_BatchTermLike): string {
  if (!batchTerm) return "";
  const batch = batchTerm.batch?.name ?? "";
  const term =
    batchTerm.name ??
    (batchTerm.termNumber != null ? `Term ${batchTerm.termNumber}` : "");
  return [batch, term].filter(Boolean).join(" / ");
}

function joinLabel(
  subject: string,
  teacher: string,
  className: string,
): string {
  const head = [subject, teacher].filter(Boolean).join(" - ");
  if (head && className) return `${head} (${className})`;
  return head || className;
}

/** "Subject - Teacher (Batch / Term)" for a teaching assignment payload. */
export function teachingAssignmentLabel(
  assignment: T_TeachingAssignmentLike,
): string {
  if (!assignment) return "";
  return joinLabel(
    subjectLabel(assignment.batchTermSubject?.subject),
    personName(assignment.teacher?.employee),
    classNameLabel(assignment.batchTermSubject?.batchTerm),
  );
}

/**
 * "Subject - Teacher (Batch / Term)" for an exam subject payload. Exam subjects
 * link to a batch term subject, whose assignments carry the teacher.
 */
export function examSubjectLabel(item: {
  teachingAssignment?: T_TeachingAssignmentLike;
  batchTermSubject?: {
    subject?: T_SubjectLike;
    batchTerm?: T_BatchTermLike;
    assignments?: Array<{
      teacher?: { employee?: T_EmployeeLike } | null;
    }> | null;
  } | null;
}): string {
  if (item.teachingAssignment)
    return teachingAssignmentLabel(item.teachingAssignment);
  return joinLabel(
    subjectLabel(item.batchTermSubject?.subject),
    personName(item.batchTermSubject?.assignments?.[0]?.teacher?.employee),
    classNameLabel(item.batchTermSubject?.batchTerm),
  );
}
