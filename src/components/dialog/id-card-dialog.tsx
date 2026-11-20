import * as React from "react";
import { createPortal } from "react-dom";
import { IdCard as IdCardIcon, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface StudentIdData {
  studentId: string;
  name: string;
  faculty?: string;
  programme: string;
  batch: string;
  dob: string;
  mobile: string;
  validUpto: string;
  photoUrl?: string | null;
  /** Optional value for the code strip; defaults to the student id. */
  qrValue?: string;
}

export interface InstitutionData {
  affiliation: string;
  name: string;
  address: string;
  phone: string;
  since?: string;
  website: string;
  email: string;
  programmes: string[];
  logoUrl?: string;
  signatureUrl?: string;
  signatureLabel?: string;
}

export const defaultInstitution: InstitutionData = {
  affiliation: "",
  name: "College",
  address: "",
  phone: "",
  since: "",
  website: "",
  email: "",
  programmes: [],
  signatureLabel: "Principal",
};

const BLUE = "#1f7bc0";
const RED = "#e0383e";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function display(value?: string | null): string {
  return (value ?? "").trim() || "—";
}

/** Decorative code strip (pure CSS bars) so the card needs no QR dependency. */
function IdCodeStrip({ value }: { value: string }) {
  const seed = (value || "STUDENT-ID").replace(/\s+/g, "");
  const bars = React.useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const code = seed.charCodeAt(index % seed.length) + index * 7;
        return { width: (code % 2) + 1, height: 16 + (code % 10) };
      }),
    [seed],
  );

  return (
    <div
      className="flex h-[26px] w-[40px] items-end justify-center gap-[0.5px] overflow-hidden"
      aria-label={`Code ${value}`}
    >
      {bars.map((bar, index) => (
        <span
          key={index}
          className="inline-block shrink-0 bg-neutral-900"
          style={{ width: bar.width, height: bar.height }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The card itself. Native size = CR80 portrait (54mm x 85.6mm).      */
/*  It is deliberately light-only: white in both themes, so it prints  */
/*  and scans exactly like the physical card.                          */
/* ------------------------------------------------------------------ */

export function IdCard({
  student,
  school,
  zoom = 1,
}: {
  student: StudentIdData;
  school: InstitutionData;
  zoom?: number;
}) {
  const rows = (
    [
      ["Name", student.name],
      student.faculty ? ["Faculty", student.faculty] : null,
      ["Programme", student.programme],
      ["Batch", student.batch],
      ["D.O.B", student.dob],
      ["Mobile No", student.mobile],
      ["Valid upto", student.validUpto],
    ] as ([string, string] | null)[]
  ).filter((row): row is [string, string] => Boolean(row));

  const hasContactBar = Boolean(school.website || school.email);
  const programmes = school.programmes.filter(Boolean).join(" | ");

  return (
    <div
      className="student-id-card relative flex flex-col overflow-hidden rounded-[8px] border border-neutral-300 bg-white text-neutral-900 shadow-md dark:bg-white dark:text-neutral-900"
      style={{
        width: "54mm",
        height: "85.6mm",
        zoom,
        colorScheme: "light",
      }}
    >
      {/* Header */}
      <div className="px-[6px] pt-[5px] pb-[3px] text-center">
        {school.affiliation ? (
          <p
            className="font-serif italic leading-none"
            style={{ color: RED, fontSize: 6.5 }}
          >
            {school.affiliation}
          </p>
        ) : null}
        <div className="mt-[3px] flex items-center gap-[4px]">
          <div className="flex w-[34px] shrink-0 flex-col items-center">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logoUrl}
                alt=""
                className="h-[26px] w-[34px] object-contain"
              />
            ) : (
              <span
                className="font-serif font-bold leading-none"
                style={{ color: BLUE, fontSize: 17 }}
              >
                {initialsOf(school.name) || "C"}
              </span>
            )}
            {school.since ? (
              <span
                className="font-bold leading-none"
                style={{ color: RED, fontSize: 4.5 }}
              >
                {school.since}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p
              className="font-bold leading-tight"
              style={{ color: BLUE, fontSize: 8.5 }}
            >
              {school.name}
            </p>
            {school.address ? (
              <p
                className="font-medium leading-tight text-neutral-700"
                style={{ fontSize: 4.8 }}
              >
                {school.address}
              </p>
            ) : null}
            {school.phone ? (
              <p
                className="font-medium leading-tight text-neutral-700"
                style={{ fontSize: 4.8 }}
              >
                Contact: {school.phone}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Student ID band */}
      <div
        className="py-[3px] text-center font-bold tracking-wide text-white"
        style={{ background: BLUE, fontSize: 11 }}
      >
        STUDENT ID: {student.studentId}
      </div>

      {/* Photo */}
      <div className="flex justify-center pt-[6px]">
        <Avatar
          className="h-[78px] w-[62px] rounded-[4px] border-2 after:hidden"
          style={{ borderColor: BLUE }}
        >
          <AvatarImage
            src={student.photoUrl ?? undefined}
            alt={student.name}
            className="rounded-[2px] object-cover"
          />
          <AvatarFallback className="rounded-[2px] bg-sky-50 text-[16px] font-semibold text-sky-700">
            {initialsOf(student.name) || "S"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Details */}
      <div className="flex flex-1 items-center justify-center px-[10px] py-[4px]">
        <dl
          className="grid grid-cols-[44px_6px_1fr] gap-y-[2.5px] font-semibold leading-[1.45]"
          style={{ fontSize: 7.2 }}
        >
          {rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt className="text-neutral-800">{label}</dt>
              <dd className="m-0">:</dd>
              <dd className="m-0 break-words">{display(value)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>

      {/* Signature + code strip */}
      <div className="flex items-end justify-between px-[10px] pb-[3px]">
        <div className="w-[70px] text-center">
          <div className="flex h-[16px] items-end justify-center">
            {school.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.signatureUrl}
                alt=""
                className="max-h-[16px] object-contain"
              />
            ) : null}
          </div>
          <div className="border-t border-dotted border-neutral-700" />
          <p className="font-medium" style={{ fontSize: 6.5 }}>
            {school.signatureLabel || "Principal"}
          </p>
        </div>
        <IdCodeStrip value={student.qrValue ?? student.studentId} />
      </div>

      {/* Footer bars */}
      {hasContactBar ? (
        <div
          className="flex items-center justify-center gap-[8px] py-[2.5px] text-white"
          style={{ background: RED, fontSize: 6 }}
        >
          {school.website ? <span>{school.website}</span> : null}
          {school.email ? <span>{school.email}</span> : null}
        </div>
      ) : null}
      {programmes ? (
        <div
          className="py-[3px] text-center font-bold text-white"
          style={{ background: BLUE, fontSize: 7 }}
        >
          {programmes}
        </div>
      ) : null}
    </div>
  );
}

const PRINT_CSS = `
  @media print {
    @page { size: 54mm 85.6mm; margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    body > *:not(#student-id-print-root) { display: none !important; }
    #student-id-print-root {
      position: fixed; inset: 0 auto auto 0;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    #student-id-print-root .student-id-card {
      box-shadow: none !important; border: 0 !important; border-radius: 0 !important;
    }
  }
`;

/**
 * Screen preview + a print-only copy rendered straight into <body> at true
 * CR80 size. Used by the ID card pages.
 */
export function IdCardPreview({
  student,
  school,
  zoom = 1.9,
}: {
  student: StudentIdData;
  school: InstitutionData;
  zoom?: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="flex justify-center overflow-x-auto py-2">
        <IdCard student={student} school={school} zoom={zoom} />
      </div>

      {mounted &&
        createPortal(
          <div id="student-id-print-root" className="hidden print:block">
            <IdCard student={student} school={school} zoom={1} />
          </div>,
          document.body,
        )}

      <style>{PRINT_CSS}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */

export function StudentIdCardDialog({
  student,
  school = defaultInstitution,
  trigger,
}: {
  student: StudentIdData;
  school?: InstitutionData;
  trigger?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <IdCardIcon className="size-4" />
            View ID card
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-fit sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Student ID card</DialogTitle>
          <DialogDescription>
            Prints at 54 × 85.6 mm (CR80). Set scale to 100% and margins to
            none.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <IdCard student={student} school={school} zoom={1.7} />
        </div>

        <DialogFooter>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print card
          </Button>
        </DialogFooter>
      </DialogContent>

      {mounted &&
        createPortal(
          <div id="student-id-print-root" className="hidden print:block">
            <IdCard student={student} school={school} zoom={1} />
          </div>,
          document.body,
        )}

      <style>{PRINT_CSS}</style>
    </Dialog>
  );
}
