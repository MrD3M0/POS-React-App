export interface T_IdCardStudent {
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string;
  admissionDateBs: string;
  photoUrl?: string | null;
  batch?: { name?: string; course?: { code?: string; name?: string } | null } | null;
  batchId?: string;
}

function addYearsBs(dateBs: string | undefined, years: number): string {
  if (!dateBs) return "—";
  const parts = String(dateBs).split("-");
  const y = Number(parts[0]);
  if (!Number.isFinite(y) || parts.length < 3) return dateBs;
  return `${y + years}-${parts[1]}-${parts[2]}`;
}

function initialsOf(s: T_IdCardStudent) {
  return [s.firstName, s.middleName, s.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .slice(0, 3)
    .join("");
}

export default function StudentIdCard({ student }: { student: T_IdCardStudent }) {
  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
  const courseName = student.batch?.course?.name ?? student.batch?.course?.code ?? "—";
  const batchName = student.batch?.name ?? "—";
  const validDate = addYearsBs(student.admissionDateBs, 4);
  const initials = initialsOf(student);
  const barcode = student.universityRegNo.replace(/\s+/g, "");
  const barcodeBars = barcode.split("").map((ch, i) => {
    const h = 14 + ((ch.charCodeAt(0) + i * 7) % 18);
    return <span key={i} className="inline-block bg-black" style={{ width: (i % 3) + 1, height: h }} />;
  });

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body * { visibility: hidden; } #print-card, #print-card * { visibility: visible; } #print-card { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div id="print-card" className="mx-auto w-full max-w-md border border-border bg-background p-5">
        <div className="border-b-2 border-primary pb-3 text-center">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Student Identity Card</div>
          <div className="mt-1 text-lg font-bold">University</div>
          <div className="text-xs text-muted-foreground">Student ID Card</div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="shrink-0">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={fullName} className="h-24 w-20 border border-border object-cover" />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center border border-border bg-muted text-xl font-bold">
                {initials || "S"}
              </div>
            )}
            <div className="mt-1 text-center font-mono text-[10px]"> {student.universityRegNo} </div>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="break-words text-base font-semibold leading-tight">{fullName}</div>
            <div className="grid grid-cols-[72px_1fr] gap-x-2 gap-y-1 text-xs">
              <span className="text-muted-foreground">Reg. No.</span>
              <span className="font-medium">{student.universityRegNo}</span>
              <span className="text-muted-foreground">Gender</span>
              <span>{student.gender ?? "—"}</span>
              <span className="text-muted-foreground">Course</span>
              <span className="break-words">{courseName}</span>
              <span className="text-muted-foreground">Batch</span>
              <span>{batchName}</span>
              <span className="text-muted-foreground">Admission</span>
              <span>{student.admissionDateBs || "—"} (BS)</span>
              <span className="text-muted-foreground">Valid Up To</span>
              <span>{validDate} (BS)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-end justify-center gap-[2px]" aria-label={`Barcode ${barcode}`}>
            {barcodeBars}
          </div>
          <div className="mt-1 text-center font-mono text-xs tracking-[0.3em]">{barcode}</div>
          <div className="mt-1 text-center text-[10px] text-muted-foreground">Valid 4 years from admission</div>
        </div>
      </div>
    </>
  );
}
