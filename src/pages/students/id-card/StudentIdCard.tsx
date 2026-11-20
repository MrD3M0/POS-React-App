import {
  IdCardPreview,
  defaultInstitution,
  type InstitutionData,
  type StudentIdData,
} from "@/components/dialog/id-card-dialog";
import { useInstitution } from "@/hooks/use-institution";

/** Shape shared by the admin and teacher student detail endpoints. */
export interface T_IdCardStudent {
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string;
  dobBs?: string | null;
  phone?: string | null;
  admissionDateBs: string;
  photoUrl?: string | null;
  batch?: {
    name?: string;
    course?: { code?: string; name?: string } | null;
  } | null;
  batchId?: string;
}

function addYearsBs(dateBs: string | undefined, years: number): string {
  if (!dateBs) return "—";
  const parts = String(dateBs).split("-");
  const y = Number(parts[0]);
  if (!Number.isFinite(y) || parts.length < 3) return dateBs;
  return `${y + years}-${parts[1]}-${parts[2]}`;
}

function fullNameOf(student: T_IdCardStudent): string {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/**
 * Maps the college identity configured by the principal (College settings)
 * onto the card. The card itself never reads a theme token, so it stays white
 * in both dark and light mode.
 */
function toInstitution(institution?: {
  affiliation?: string;
  name?: string;
  address?: string;
  phone?: string;
  since?: string;
  website?: string;
  email?: string;
  programmes?: string[];
  logoUrl?: string;
  signatureUrl?: string;
  signatureLabel?: string;
}): InstitutionData {
  return {
    affiliation: institution?.affiliation ?? defaultInstitution.affiliation,
    name: institution?.name || defaultInstitution.name,
    address: institution?.address ?? defaultInstitution.address,
    phone: institution?.phone ?? defaultInstitution.phone,
    since: institution?.since ?? defaultInstitution.since,
    website: institution?.website ?? defaultInstitution.website,
    email: institution?.email ?? defaultInstitution.email,
    programmes: institution?.programmes ?? defaultInstitution.programmes,
    logoUrl: institution?.logoUrl || undefined,
    signatureUrl: institution?.signatureUrl || undefined,
    signatureLabel:
      institution?.signatureLabel || defaultInstitution.signatureLabel,
  };
}

export default function StudentIdCard({ student }: { student: T_IdCardStudent }) {
  const { data } = useInstitution();
  const institution = toInstitution(data?.data);

  const studentId = student.universityRegNo || "—";
  const card: StudentIdData = {
    studentId,
    name: fullNameOf(student) || "Student",
    programme:
      student.batch?.course?.name ?? student.batch?.course?.code ?? "—",
    batch: student.batch?.name ?? "—",
    dob: student.dobBs || "—",
    mobile: student.phone || "—",
    validUpto: addYearsBs(student.admissionDateBs, 4),
    photoUrl: student.photoUrl ?? undefined,
    qrValue: studentId,
  };

  return <IdCardPreview student={card} school={institution} />;
}
