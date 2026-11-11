import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/context/auth-context";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listAudienceBatches,
  listMyTeachingClasses,
  NOTICE_ROLE_OPTIONS,
  type T_NOTICE_AUDIENCE,
} from "@/pages/notices/service/service";
import MultiSelect, {
  type T_MultiSelectOption,
} from "@/components/common/multi-select";
import { Label } from "@/components/ui/label";

type T_BATCH_ROW = {
  id: string;
  name?: string;
  course?: { name?: string } | null;
};

type T_ASSIGNMENT_ROW = {
  id: string;
  batchTermSubject?: {
    subject?: { code?: string; name?: string } | null;
    batchTerm?: {
      name?: string | null;
      batch?: { id?: string; name?: string } | null;
    } | null;
  } | null;
};

/** Options of the classes a teacher may address (their own classes only). */
function useTeacherClassOptions() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES, "audience"],
    queryFn: () => listMyTeachingClasses(),
  });

  const options: T_MultiSelectOption[] = [];
  const seen = new Map<string, { label: string; subjects: string[] }>();

  const rows: T_ASSIGNMENT_ROW[] = Array.isArray(query.data?.data)
    ? query.data.data
    : Array.isArray(query.data?.data?.data)
      ? query.data.data.data
      : [];

  for (const row of rows) {
    const batch = row.batchTermSubject?.batchTerm?.batch;
    if (!batch?.id) continue;
    const subject =
      row.batchTermSubject?.subject?.name ??
      row.batchTermSubject?.subject?.code;
    const existing = seen.get(batch.id);
    if (existing) {
      if (subject && !existing.subjects.includes(subject)) {
        existing.subjects.push(subject);
      }
      continue;
    }
    seen.set(batch.id, {
      label: batch.name ?? batch.id,
      subjects: subject ? [subject] : [],
    });
  }

  for (const [id, value] of seen) {
    options.push({
      label: value.label,
      value: id,
      description: value.subjects.length ? value.subjects.join(", ") : undefined,
    });
  }

  return { options, isLoading: query.isLoading, isError: query.isError };
}

/** Options of every class of the college (for admin / principal / accountant). */
function useAllClassOptions() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "audience"],
    queryFn: () => listAudienceBatches(),
  });

  const rows: T_BATCH_ROW[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];

  const options: T_MultiSelectOption[] = rows.map((batch) => ({
    label: batch.name ?? batch.id,
    value: batch.id,
    description: batch.course?.name,
  }));

  return { options, isLoading: query.isLoading, isError: query.isError };
}

interface NoticeAudienceFieldProps {
  value: T_NOTICE_AUDIENCE;
  onChange: (value: T_NOTICE_AUDIENCE) => void;
  disabled?: boolean;
}

/**
 * Who receives the notice.
 *
 * - Admin / Principal / Accountant: the whole college, or a hand-picked set of
 *   roles and/or classes.
 * - Teacher: only the classes they teach (the backend enforces this too).
 */
export default function NoticeAudienceField({
  value,
  onChange,
  disabled,
}: NoticeAudienceFieldProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const teacherClasses = useTeacherClassOptions();
  const allClasses = useAllClassOptions();

  const classOptions = isTeacher ? teacherClasses.options : allClasses.options;
  const classesLoading = isTeacher
    ? teacherClasses.isLoading
    : allClasses.isLoading;

  if (isTeacher) {
    return (
      <div className="space-y-2">
        <Label>Audience</Label>
        <MultiSelect
          options={classOptions}
          value={value.batchIds}
          onChange={(batchIds) =>
            onChange({ mode: "TARGETED", roles: [], batchIds })
          }
          placeholder={
            classesLoading ? "Loading your classes..." : "Select your class"
          }
          searchPlaceholder="Search your classes..."
          emptyText="You have no class assigned yet."
          loading={classesLoading}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          A teacher notice can only be sent to the students of the classes they
          teach.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Audience</Label>
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="notice-audience-mode"
            className="size-4 accent-primary"
            checked={value.mode === "EVERYONE"}
            disabled={disabled}
            onChange={() => onChange({ mode: "EVERYONE", roles: [], batchIds: [] })}
          />
          Everyone in the college
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="notice-audience-mode"
            className="size-4 accent-primary"
            checked={value.mode === "TARGETED"}
            disabled={disabled}
            onChange={() =>
              onChange({
                mode: "TARGETED",
                roles: value.roles,
                batchIds: value.batchIds,
              })
            }
          />
          Specific roles and/or classes
        </label>
      </div>

      {value.mode === "TARGETED" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Roles</Label>
            <MultiSelect
              options={NOTICE_ROLE_OPTIONS}
              value={value.roles}
              onChange={(roles) => onChange({ ...value, roles })}
              placeholder="Select roles"
              searchPlaceholder="Search roles..."
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Classes</Label>
            <MultiSelect
              options={classOptions}
              value={value.batchIds}
              onChange={(batchIds) => onChange({ ...value, batchIds })}
              placeholder={classesLoading ? "Loading classes..." : "Select classes"}
              searchPlaceholder="Search classes..."
              emptyText="No classes found."
              loading={classesLoading}
              disabled={disabled}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Nobody is excluded — every student, teacher and staff member sees this
          notice.
        </p>
      )}
    </div>
  );
}
