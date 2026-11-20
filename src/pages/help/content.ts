/**
 * Help content for the Help page.
 *
 * Three parts:
 *  - how the application is run (local setup),
 *  - the keyboard shortcuts,
 *  - what each module does and what the signed-in role may do with it.
 */

export type T_HelpShortcut = {
  keys: string[];
  what: string;
  where?: string;
};

export type T_HelpModule = {
  name: string;
  what: string;
  roles: string;
};

export type T_HelpFlow = {
  title: string;
  steps: string[];
};

export type T_HelpFaq = {
  /** Module the guide belongs to — used to group the questions. */
  module: string;
  question: string;
  /** Step 1, Step 2 … — each step is a title plus the detail. */
  steps: { title: string; detail: string }[];
};

export type T_HelpRoleGuide = {
  title: string;
  summary: string;
  can: string[];
  cannot: string[];
  flows: T_HelpFlow[];
};

export const HELP_SHORTCUTS: T_HelpShortcut[] = [
  {
    keys: ["Ctrl", "K"],
    what: "Open the command palette — jump to any page of your role, run quick actions, switch the theme.",
    where: "Anywhere in the app",
  },
  {
    keys: ["Ctrl", "B"],
    what: "Collapse / expand the sidebar.",
    where: "Anywhere in the app",
  },
  {
    keys: ["Esc"],
    what: "Close the open dialog, drawer, popover or the command palette.",
    where: "Anywhere in the app",
  },
  {
    keys: ["Enter"],
    what: "Confirm the focused row or submit the open form.",
    where: "Tables and forms",
  },
  {
    keys: ["↑", "↓"],
    what: "Move through the options of a select box, a date picker or the command palette.",
    where: "Pickers and the palette",
  },
  {
    keys: ["Ctrl", "Enter"],
    what: "Submit a form without leaving the keyboard.",
    where: "Forms",
  },
];

export const HELP_SETUP: T_HelpFlow[] = [
  {
    title: "1. What you need",
    steps: [
      "Node.js 20+ and pnpm (the repo uses a pnpm workspace layout).",
      "A PostgreSQL database — the dev setup points at postgresql://postgres:root@localhost:5432/CRUD_DB.",
      "The two folders of this repo: CollegeMS-Backend-Node (API) and CollegeMS-React-App (web app).",
    ],
  },
  {
    title: "2. Start the backend (API on port 8000)",
    steps: [
      "cd CollegeMS-Backend-Node",
      "pnpm install",
      "Check .env: DATABASE_URL, JWT_SECRET and PORT=8000.",
      "pnpm db:generate   (generates the Prisma client into src/generated/prisma)",
      "pnpm db:migrate    (or pnpm db:push for a fresh database)",
      "pnpm db:seed:all   (creates the login accounts only — enter each module's data yourself)",
      "pnpm dev            (http://localhost:8000/api)",
    ],
  },
  {
    title: "3. Start the frontend (web app on port 5173)",
    steps: [
      "cd CollegeMS-React-App",
      "pnpm install",
      "Check .env: VITE_API_BASE_URL=\"http://localhost:8000/api\".",
      "pnpm dev            (http://localhost:5173)",
    ],
  },
  {
    title: "4. Sign in",
    steps: [
      "Open http://localhost:5173 and log in.",
      "The seeded accounts live in SEED_CREDENTIALS.md (admin, principal, accountant, teacher, staff — password Password@123).",
      "The login page sends every role to its own dashboard; teachers land on the teacher dashboard.",
    ],
  },
  {
    title: "5. Useful commands",
    steps: [
      "pnpm lint           (frontend ESLint)",
      "pnpm build          (frontend production build)",
      "pnpm test:api       (backend API tests)",
      "pnpm db:studio      (browse the database)",
    ],
  },
];

export const HELP_MODULES: T_HelpModule[] = [
  {
    name: "Dashboard",
    what: "The landing page of your role: the key numbers, the alerts you must act on and shortcuts into every module. Every card loads on its own, so one failing card never breaks the page.",
    roles: "All roles (each sees their own dashboard)",
  },
  {
    name: "Students",
    what: "Admission and student records: personal details, guardians, batch, status and approval. A teacher can add a student to their own class; an admin or the principal approves them, and the approval assigns the fee.",
    roles: "Admin (manage + approve), Principal (read + approve), Teacher (own students + add)",
  },
  {
    name: "Academic structure",
    what: "The course → batch → term → subject tree that everything else hangs on. Creating a batch creates its terms; Term Subjects attaches subjects (with credit hours and elective flags); Teaching Assignments links a teacher; Class Schedules builds the weekly timetable.",
    roles: "Admin (manage), Principal / Accountant (read), Teacher (own classes)",
  },
  {
    name: "Lookups",
    what: "The shared reference lists used everywhere else: leave types, periods (daily class slots), exam types, grade scales and fee heads. Add a value here before a form asks for it.",
    roles: "Admin (manage), others (read where used)",
  },
  {
    name: "Attendance",
    what: "Daily student attendance per class (the teacher marks it on the sheet, with an edit window) and employee attendance (the accountant marks it). Attendance feeds the attendance percentage, the low-attendance list and the payroll.",
    roles: "Teacher (students), Accountant (employees), Principal (read employee attendance)",
  },
  {
    name: "Exams & results",
    what: "Exams and exam subjects, marks entry, marks submission, result calculation and the principal's review, approval and publishing.",
    roles: "Teacher (exams + marks + submit), Principal (approve + publish)",
  },
  {
    name: "Fees",
    what: "Fee heads, fee structures (per course, with an optional batch override), assignment of a fee to a student or a whole batch, installments, payments and receipts.",
    roles: "Accountant (manage), Principal (read), Admin (read-only pages)",
  },
  {
    name: "Scholarships",
    what: "Scholarship schemes (a percentage or a fixed amount) and the grants given to students. The discount lands on the student's fee items, so the dues drop immediately.",
    roles: "Accountant + Admin (schemes and grants), Principal (read)",
  },
  {
    name: "Batch pay",
    what: "Extra pay for a teacher on top of the base salary, per teaching assignment (a class). It is added to the payslip as \"Teaching pay\".",
    roles: "Accountant + Admin (manage), Teacher (read own)",
  },
  {
    name: "Payroll",
    what: "The monthly payroll run, payslips, approval by the principal and marking the payroll as paid. Paying posts the journal and locks that month's employee attendance.",
    roles: "Accountant (create, submit, pay), Principal (approve)",
  },
  {
    name: "Notices",
    what: "Announcements with an audience: everybody, a role, or (for a teacher) the students of one of their classes.",
    roles: "Admin / Principal / Accountant (everybody), Teacher (own classes), Staff (read)",
  },
  {
    name: "Notifications",
    what: "The bell in the header: the notices meant for you plus the alerts your dashboard shows (pending attendance, marks, approvals, payroll).",
    roles: "All roles",
  },
  {
    name: "Staff & employees",
    what: "Employee records with their role profile, contact details and the employee/teacher/principal/accountant profiles. Teachers and Staff are read-only directories; Employees is where the records are edited.",
    roles: "Admin (manage), Principal (read directories), others (own profile)",
  },
  {
    name: "Settings & audit",
    what: "College identity (name, logo, address, affiliation, contacts, signature), the attendance edit window, the working-days mode, auto-assign fees on admission and the receipt prefix — plus the audit log of who changed what.",
    roles: "Admin (all settings + audit), Principal (college identity only)",
  },
];

export const HELP_ROLE_GUIDES: Record<string, T_HelpRoleGuide> = {
  ADMIN: {
    title: "Admin — set the college up and keep it running",
    summary:
      "You own the master data, the people and the approvals. Everything else in the college depends on what you set up first.",
    can: [
      "Create employees and their logins, and give each person a role (admin, principal, accountant, teacher, staff).",
      "Set up the academic structure: courses → batches → terms → subjects, then assign the subjects to each term with their credit hours.",
      "Build the timetable: teaching assignments (who teaches what) and class schedules (when and in which period).",
      "Admit students, approve them, and print their ID cards.",
      "Create scholarship schemes and grant them; set the extra class pay (batch pay) of the teachers.",
      "Manage holidays, fiscal years, lookups, notices and the college settings.",
      "Read the audit log of every privileged change.",
    ],
    cannot: [
      "Approve or publish results — that is the principal's job.",
      "Prepare or pay the payroll — that is the accountant's job.",
      "Record fee payments or define fee structures — the accountant owns the fees.",
    ],
    flows: [
      {
        title: "First time setup (do it in this order)",
        steps: [
          "Fiscal years: create the current BS year (System → Fiscal years).",
          "Lookups: leave types, periods, exam types, grade scales and fee heads (Academics → Lookups).",
          "Academic structure: courses → batches (their terms are created automatically) → subjects.",
          "Terms → open each term → Term Subjects: tick the subjects, set the credit hours and the elective flag, then Assign.",
          "Teaching assignments (batch → term → subject → teacher), then Class Schedules (assignment + period + day).",
          "Employees → New Employee for every person, with the role and the login they will use.",
          "Ask the accountant for the fee structures, then set Settings → College so the ID cards and receipts print correctly.",
        ],
      },
      {
        title: "Admitting a student",
        steps: [
          "The student is added (by you or by a teacher) and starts as PENDING.",
          "Approve the student — the college fee of their batch (or the course default) is assigned automatically.",
          "If no fee structure existed for that batch, the fee is skipped and the warning tells you to ask the accountant to assign it by hand.",
          "Open the student's ID Card from the row menu and print it once the record is approved.",
        ],
      },
      {
        title: "Keeping a term correct",
        steps: [
          "Terms → click the term name to open its Term Subjects.",
          "Assign any missing subject with its credit hour and elective flag.",
          "Remove a subject only after the teaching assignment, exam subject or attendance sessions that use it are gone — the page refuses otherwise and names what is linked.",
        ],
      },
    ],
  },
  PRINCIPAL: {
    title: "Principal — approve, oversee and own the college identity",
    summary:
      "You are the approving authority of the college: students, results and payroll stop with you. You also own the identity printed on the ID cards.",
    can: [
      "Approve or reject the students a teacher added, and print their ID cards.",
      "Review the results the teachers submit, approve or reject them, then publish them.",
      "Approve or reject the payroll the accountant prepares.",
      "Review the employee attendance the accountant marks.",
      "Read every academic page (batches, terms, subjects, teaching assignments, class schedules) and every report.",
      "Read the fees, the scholarships granted and the audit trail of the records you can see.",
      "Edit the college identity (College Settings): name, address, affiliation, contacts, logo, signature and programmes.",
      "Send notices to everybody or to selected roles and classes.",
    ],
    cannot: [
      "Enter marks, take attendance or change a session a teacher saved.",
      "Mark or correct employee attendance — the accountant does that.",
      "Prepare or pay the payroll — the accountant does that.",
      "Grant or revoke a scholarship — the accountant does that.",
      "Change the academic structure, the users or the other settings — the admin does that.",
    ],
    flows: [
      {
        title: "Publishing the results",
        steps: [
          "Results → Pending Results: review the subjects the teachers submitted.",
          "Approve (or reject with a reason) each subject; a rejected subject goes back to the teacher.",
          "Results → Publish Results once every subject of the batch + term group is approved.",
        ],
      },
      {
        title: "Payroll approval",
        steps: [
          "The accountant creates the month, checks it and submits it.",
          "Pending Payroll: check the payslips, then approve or reject with a remark.",
          "The accountant marks the approved payroll as paid; paying posts the journal and locks attendance.",
        ],
      },
      {
        title: "Approving a new student",
        steps: [
          "Student Approval lists the students added by teachers or the admin.",
          "Approve the ones whose record is complete; the college fee is assigned at that moment.",
          "Reject the others with a reason so the person who added them knows what to fix.",
        ],
      },
      {
        title: "Updating the ID card identity",
        steps: [
          "College Settings → College: name, address, affiliation, email, phone, website, since year, programmes, PAN, logo and signature.",
          "Save College. The logo and signature previews show exactly what the card will print.",
          "Open any student ID card (Students → ID Card) and print it.",
        ],
      },
    ],
  },
  ACCOUNTANT: {
    title: "Accountant — the money of the college",
    summary:
      "You own the fees, the payments, the scholarships, the employee attendance and the payroll. The college fees of a student reach them through the fee structures.",
    can: [
      "Define fee structures per course (with an optional batch override) and their fee items.",
      "Assign a fee structure to one student or to a whole batch (also happens automatically on approval).",
      "Read a student's installment plan and record payments, split over fee items, then print the receipt.",
      "Cancel a payment or a receipt with a reason (append-only reversal).",
      "Create scholarship schemes and grant or revoke them for students.",
      "Mark and review employee attendance, which feeds the payroll.",
      "Set the extra class pay of a teacher (batch pay).",
      "Create, submit and pay the monthly payroll.",
      "Post journal entries and read the ledgers.",
      "Publish notices to everybody or to selected roles and classes.",
      "Open the students, batches, terms, subjects and teaching assignments read-only.",
    ],
    cannot: [
      "Approve the payroll — the principal does that.",
      "Approve or publish results, or admit a student.",
      "Create or edit users, employees, the academic structure or the settings.",
    ],
    flows: [
      {
        title: "What a student owes",
        steps: [
          "Fee Structures: a course (optionally one batch) holds the fee heads and the amounts, one-time or per term.",
          "Assign Student / Assign Batch: the items are copied to the student, so the dues appear.",
          "Approving a student also assigns the fee automatically when auto-assign is on and a structure exists.",
          "The student fee can then carry a scholarship discount and an installment plan.",
          "Payments are recorded on Finance → Student Fees → Record Payment; the receipt can be printed or reprinted.",
        ],
      },
      {
        title: "Giving a scholarship",
        steps: [
          "Scholarships → Scholarship Schemes → New Scholarship Scheme: a percentage or a fixed amount.",
          "Scholarships → Granted Scholarships → Grant Scholarship: pick the student, their fee and the fee items to discount.",
          "The dues drop immediately; the grant stays as the audit trail.",
          "Revoke from the same page. It is refused once a payment is allocated to the discounted fee.",
        ],
      },
      {
        title: "The monthly payroll",
        steps: [
          "Attendance: make sure the month's employee attendance is complete and correct.",
          "Payroll → Create Payroll: pick the fiscal year and the BS month; the payslips are generated as a DRAFT.",
          "Check the payslips, then Submit. The principal approves or rejects it.",
          "Once APPROVED, press Pay with the BS paid date. Paying posts the payroll journal and locks the month's attendance.",
        ],
      },
    ],
  },
  TEACHER: {
    title: "Teacher — your classes, every day",
    summary:
      "You see your own classes, your students, your exams and your results. Everything you do stays inside the classes you teach.",
    can: [
      "See your dashboard: classes, students, attendance %, pending attendance and pending marks.",
      "See your classes and your weekly timetable (My Classes, My Calendar).",
      "Take the attendance of your class and correct it until the session is locked.",
      "Create exams and exam subjects for your classes.",
      "Enter the marks of your exam subjects, generate results and submit them to the principal.",
      "See your students, their attendance and their results, and add a student to your class.",
      "Send a notice to the students of one of your classes.",
      "Read your own batch pay (the extra class pay that goes to the payroll).",
    ],
    cannot: [
      "Change the college fees, scholarships or the payroll.",
      "Approve or publish results — the principal does that.",
      "Send a notice to the whole college — only admin, principal and accountant can.",
      "See the classes or the students of other teachers.",
      "Edit attendance after the college's edit window has passed.",
    ],
    flows: [
      {
        title: "A normal teaching day",
        steps: [
          "Dashboard: check the pending attendance and the marks that still need work.",
          "Take Attendance: pick the class, the period and the date, mark the sheet, add leave remarks and save.",
          "Marks Entry: open the exam and the exam subject, fill the marks, save.",
          "Marks Submission: submit each subject; the principal approves or rejects it.",
          "Results: generate the result of each student from the exam.",
        ],
      },
      {
        title: "Noticing a low attendance student",
        steps: [
          "Dashboard → Low attendance lists the students below the threshold.",
          "Open Students to see the student and their attendance summary.",
          "Attendance Sessions: check what happened in the sessions you took.",
        ],
      },
      {
        title: "Notifying your class",
        steps: [
          "Notices → New Notice: pick the class (only your own classes are listed).",
          "The notice reaches the students of that class and shows up in their bell.",
        ],
      },
      {
        title: "Fixing a rejected submission",
        steps: [
          "Marks Submission shows the subject as REJECTED with the principal's reason.",
          "Marks Entry: correct the marks or the absent flags and save the sheet again.",
          "Submit the subject again; it returns to PENDING for the principal.",
        ],
      },
    ],
  },
  STAFF: {
    title: "Staff — your profile, your payslip, your attendance",
    summary:
      "You look after yourself here: your profile, your payslips, your attendance, your leave and the notices of the college.",
    can: [
      "Keep your profile up to date (name, phone, address, department).",
      "See your payslips and open the breakdown of every month.",
      "Check your own attendance and apply for leave.",
      "Read the notices of the college and the notifications in the bell.",
    ],
    cannot: [
      "Mark your own attendance or change a day — the accountant does that.",
      "See the students, the fees, the payroll of other people or the settings.",
      "Change your employee code, designation, role, join date or bank details — the admin does that.",
    ],
    flows: [
      {
        title: "Checking my payslip",
        steps: [
          "My Payslips: pick a month and open the payslip for the breakdown.",
          "My Attendance: check the days that were counted for that month.",
        ],
      },
      {
        title: "Applying for leave",
        steps: [
          "My Leave: pick the BS date, an optional leave type and a remark.",
          "Press Apply Leave; the request appears in the list below and counts as a LEAVE day.",
          "Tell the accountant if the month's payroll is still open and the leave needs a correction.",
        ],
      },
    ],
  },
};

export const HELP_FALLBACK_ROLE: T_HelpRoleGuide = {
  title: "Your account",
  summary: "Your account is signed in, but no role guide is written for it yet.",
  can: [],
  cannot: [],
  flows: [],
};

/**
 * "How do I …?" — every workflow of each role, grouped by module.
 *
 * The order of the modules here is the order the Help page shows them in.
 */
export const HELP_FAQ: Record<string, T_HelpFaq[]> = {
  ADMIN: [
    // ── Getting started ────────────────────────────────────────────────────
    {
      module: "Getting started",
      question: "How do I set the college up from scratch?",
      steps: [
        {
          title: "Start with the fiscal year",
          detail:
            "System → Fiscal years → New Fiscal Year. Give it a name (for example 2082/83), the BS start and end dates, and switch on Current. Payroll runs and payments are booked against it.",
        },
        {
          title: "Fill the lookups",
          detail:
            "Academics → Lookups holds the shared lists: leave types, periods (the daily class slots), exam types, grade scales and fee heads (Tuition, Admission, Lab, Library...). Everything else picks its values from here.",
        },
        {
          title: "Build the academic tree",
          detail:
            "Academics → Courses (code, name, semester or yearly, total terms), then Batches under a course, then Subjects (code and name). Creating a batch also creates all of its terms.",
        },
        {
          title: "Attach subjects to every term",
          detail:
            "Terms → open a term → Term Subjects. Tick the subjects, set the credit hours and the elective flag, then press Assign. A term with no subjects cannot be taught, examined or scheduled.",
        },
        {
          title: "Add the people and the timetable",
          detail:
            "Employees → New Employee creates the person and their login in one wizard. Then Teaching Assignments (batch → term → subject → teacher) and Class Schedules (teaching assignment + period + day).",
        },
        {
          title: "Set the fees and the identity",
          detail:
            "The accountant defines the fee structures. Here set Settings → College (name, logo, address, affiliation, contacts, signature) so ID cards and receipts print with the right identity.",
        },
      ],
    },
    {
      module: "Getting started",
      question: "How do I find a page or an action quickly?",
      steps: [
        {
          title: "Use the command palette",
          detail:
            "Press Ctrl + K (⌘ + K on macOS). It lists every page your role can open, the quick actions of your role and the theme switch. Type a few letters and press Enter.",
        },
        {
          title: "Search inside a list",
          detail:
            "Every list has a search box and the filters that matter for it (status, batch, role, approval state...). The search covers the columns shown on that page.",
        },
        {
          title: "Open Help",
          detail:
            "Help → My role is the short version of what you may do; Help → How do I...? is this complete workflow list; Help → Modules explains what every module is for.",
        },
      ],
    },

    // ── People ─────────────────────────────────────────────────────────────
    {
      module: "People",
      question: "How do I create a login for a new employee?",
      steps: [
        {
          title: "Open the employee wizard",
          detail:
            "Employees → New Employee. A user account is created together with the employee record, so you do not have to create the login separately.",
        },
        {
          title: "Step 1 — Personal information",
          detail:
            "First name, middle name, last name, gender, date of birth (BS), phone and the permanent and temporary addresses.",
        },
        {
          title: "Step 2 — Employment",
          detail:
            "Employee code, designation, role (Admin, Principal, Accountant, Teacher or Staff), join date (BS), and the email and password the person will sign in with.",
        },
        {
          title: "Step 3 — Bank and review",
          detail:
            "PAN, SSF number, bank name and account number, then review everything and save. The new user can sign in immediately with that email and password.",
        },
      ],
    },
    {
      module: "People",
      question: "How do I add a teacher or a staff member?",
      steps: [
        {
          title: "Create the employee",
          detail:
            "Employees → New Employee: pick the role Teacher or Staff in step 2. A teacher appears in Teaching Assignments and My Classes; a staff member gets the staff profile, payslips and leave pages.",
        },
        {
          title: "Check the directory",
          detail:
            "People → Teachers and People → Staff are read-only directories for finding someone quickly. Editing is always done from Employees.",
        },
        {
          title: "Give them work",
          detail:
            "A teacher needs a Teaching Assignment before they see a class. Until then their dashboard is empty and their class pickers have no options.",
        },
      ],
    },
    {
      module: "People",
      question: "How do I reset a password, unlock or deactivate an account?",
      steps: [
        {
          title: "Find the user",
          detail:
            "Users → filter by role or active status, or search by email or username. The list shows the linked person, whether the account is active, locked or unverified, and the last login.",
        },
        {
          title: "Open the row menu",
          detail:
            "Reset password asks for a new temporary password. Unlock clears a lockout after failed sign-ins. Activate / Deactivate flips the account and asks for a reason.",
        },
        {
          title: "Restore or delete",
          detail:
            "Delete is a soft delete and asks for confirmation; Restore brings a deleted account back. Deactivation is the safer choice for someone who has left.",
        },
      ],
    },
    {
      module: "People",
      question: "How do I change someone's role or their details?",
      steps: [
        {
          title: "Open the employee record",
          detail:
            "Employees → row action Edit. The same three steps as the wizard open with the current values.",
        },
        {
          title: "Change the role",
          detail:
            "The role lives in the Employment step. Changing it changes which menu and permissions the person gets the next time they sign in.",
        },
        {
          title: "Keep access in sync",
          detail:
            "The Users page manages the account itself (active, locked, password). The employee record manages the person and their job details. Use the right page for the right change.",
        },
      ],
    },

    // ── Students ───────────────────────────────────────────────────────────
    {
      module: "Students",
      question: "How do I add a student?",
      steps: [
        {
          title: "Open the admission form",
          detail:
            "Students → New Student. Fill the personal details, the guardian/contact details and the batch the student joins.",
        },
        {
          title: "Save the record",
          detail:
            "The student is created with the approval status PENDING. A pending student has no fees yet and is not counted as an active student.",
        },
        {
          title: "Approve the student",
          detail:
            "From the Students list filter Approval = Pending and choose Approve in the row menu. Approval is what assigns the college fee, so do it once the details are correct.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I approve a student and assign their fees?",
      steps: [
        {
          title: "Find the pending students",
          detail:
            "Students → set Approval to Pending. Teachers can add students too; everything they add waits here.",
        },
        {
          title: "Approve the row",
          detail:
            "Open the row menu and press Approve. The student becomes APPROVED/ACTIVE and the fee structure of their batch (or the course default) is assigned automatically.",
        },
        {
          title: "If the fee was skipped",
          detail:
            "When the batch has no fee structure the approval still works but the warning says the fee was not assigned. The accountant then assigns it by hand from Fee Structures → Assign Student or Assign Batch.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I edit a student or change their batch or status?",
      steps: [
        {
          title: "Open the student",
          detail:
            "Students → row action Edit. Personal details, guardians, the batch and the status can be changed.",
        },
        {
          title: "Status meanings",
          detail:
            "Active is a current student; Graduated, Dropped and Suspended keep the record but take the student out of the active flow. Use a status change instead of deleting when the student really existed.",
        },
        {
          title: "Changing the batch",
          detail:
            "Moving a batch changes the class the student belongs to. The fee already assigned stays as it is, so tell the accountant when a move needs a different fee structure.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I print a student ID card?",
      steps: [
        {
          title: "Open the card",
          detail:
            "Students → row menu ID Card. The card opens with the student's real data (name, registration number, batch, programme) and the college identity.",
        },
        {
          title: "Print it",
          detail:
            "Press Print. The card is CR80-sized and stays white in both light and dark mode, so it prints the same everywhere. The print dialog only prints the card, not the page around it.",
        },
        {
          title: "Fix the printed details",
          detail:
            "The logo, college name, address, email, phone, affiliation, programmes and signature come from Settings → College. The principal can edit that section too, from Principal → College Settings.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I remove a student?",
      steps: [
        {
          title: "Use delete only for mistakes",
          detail:
            "Students → row menu Delete → confirm. Deleting is meant for a record created by mistake.",
        },
        {
          title: "Prefer a status change",
          detail:
            "A real student who left should be set to Dropped (or Graduated) in Edit, so their attendance, fees and results history stays intact.",
        },
      ],
    },

    // ── Academics ──────────────────────────────────────────────────────────
    {
      module: "Academics",
      question: "How do I create a course?",
      steps: [
        {
          title: "Open Courses",
          detail:
            "Academics → Courses → New Course. The course is the top of the academic tree: a programme such as BSc CSIT or BBA.",
        },
        {
          title: "Fill the details",
          detail:
            "Code and name, the system (Semester or Yearly), the total number of terms (semesters or years) and an optional description. Leave Active on unless the course is retired.",
        },
        {
          title: "What happens next",
          detail:
            "A batch of this course gets exactly that many terms created automatically. Changing the total later only affects batches created afterwards.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I create a batch?",
      steps: [
        {
          title: "Open Batches",
          detail:
            "Academics → Batches → New Batch. Pick the course and give the batch a name (for example 2082 Intake).",
        },
        {
          title: "Fill the dates and the current term",
          detail:
            "The BS start date, the current term number and the active flag. The current term decides which term the batch highlights as current.",
        },
        {
          title: "Terms are created for you",
          detail:
            "Saving the batch creates Semester/Year 1 to N from the course's total terms. You normally do not have to create them by hand — use New Term only for an extra or repeated term.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I create a term?",
      steps: [
        {
          title: "Check the batch first",
          detail:
            "Most terms already exist because they were created with the batch. Open Terms to see them before adding another one.",
        },
        {
          title: "Add the term",
          detail:
            "Terms → New Term: pick the batch, the term number and the name, then the BS start and end dates. The batch and term number must not already exist.",
        },
        {
          title: "Use it for extra terms",
          detail:
            "New Term is for a summer term, a repeat term or a correction. If you only need to change dates, edit the existing term instead.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I assign subjects to a term?",
      steps: [
        {
          title: "Open the term",
          detail:
            "Academics → Terms and click the term name (not Edit). The Term Subjects page opens for that batch and term.",
        },
        {
          title: "Pick the subjects",
          detail:
            "Search the subject list and tick every subject taught in this term. Subjects already assigned are disabled and marked Assigned, so nothing is added twice.",
        },
        {
          title: "Set credit hours and elective",
          detail:
            "For each ticked subject set the credit hour (a positive number, decimals allowed) and tick Elective when the subject is optional for the students.",
        },
        {
          title: "Assign them",
          detail:
            "Press Assign N subjects. The subjects now appear in the assigned list and become available under Teaching Assignments, Exam Subjects and Term Subjects.",
        },
        {
          title: "Remove one later",
          detail:
            "Remove in the assigned list. Removal is refused while a teaching assignment, an exam subject or an attendance session still uses it — remove those first.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I create a subject?",
      steps: [
        {
          title: "Open Subjects",
          detail:
            "Academics → Subjects → New Subject. A subject is college-wide; it is not tied to one course or term until you assign it.",
        },
        {
          title: "Fill the details",
          detail:
            "A unique code (up to 20 characters), the name, an optional description and the active flag.",
        },
        {
          title: "Set credit hours per term",
          detail:
            "Credit hours and the elective flag are set when the subject is assigned to a term, because the same subject can carry different credit in different programmes.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I assign a teacher to a class?",
      steps: [
        {
          title: "Open Teaching Assignments",
          detail:
            "Academics → Teaching Assignments → New. This page is the link between the academic tree and the teacher.",
        },
        {
          title: "Follow the cascade",
          detail:
            "Pick the Batch, then the Semester/Year (the batch term), then the Subject (only subjects already assigned to that term are listed), then the Teacher.",
        },
        {
          title: "Set the period",
          detail:
            "The assigned and end dates (BS) say when the teacher teaches that class. The page shows the teacher's current workload so you can spread the classes fairly.",
        },
        {
          title: "What the teacher gets",
          detail:
            "The assignment fills the teacher's My Classes and class pickers, and it is the unit that batch pay and class schedules attach to.",
        },
      ],
    },
    {
      module: "Academics",
      question: "How do I build the class timetable?",
      steps: [
        {
          title: "Create the periods first",
          detail:
            "Academics → Lookups → Periods. A period is a daily slot (for example 1st period, 10:00–10:45) and the timetable is built from these slots.",
        },
        {
          title: "Add a schedule row",
          detail:
            "Academics → Class Schedules → New. Choose the teaching assignment, the day of the week, the period, an optional room, and the BS dates the schedule is effective.",
        },
        {
          title: "Fill the week",
          detail:
            "Repeat for every class the teacher has. A teaching assignment can appear on several days, but the same teacher should not be put in two places in the same period.",
        },
        {
          title: "Check it",
          detail:
            "The Class Schedules list and the teacher's My Calendar show the result. Deactivate a row instead of deleting it when a timetable changes mid-term.",
        },
      ],
    },

    // ── Scholarships ───────────────────────────────────────────────────────
    {
      module: "Scholarships",
      question: "How do I create a scholarship scheme?",
      steps: [
        {
          title: "Open Scholarship Schemes",
          detail:
            "Scholarships → Scholarship Schemes → New Scholarship Scheme. The scheme is the rule, not the award: it is reused for every student who receives it.",
        },
        {
          title: "Choose the type",
          detail:
            "Percent takes a percentage off the selected fee items; Fixed takes a fixed amount. Give it a clear name and code, then leave it Active.",
        },
        {
          title: "Note what it does not do",
          detail:
            "A scheme alone changes nothing. It only discounts a student after it is granted from Granted Scholarships.",
        },
      ],
    },
    {
      module: "Scholarships",
      question: "How do I grant a scholarship to a student?",
      steps: [
        {
          title: "Open the grants",
          detail:
            "Scholarships → Granted Scholarships → Grant Scholarship. Only students who already have a fee can receive a scholarship.",
        },
        {
          title: "Pick the scheme and the student",
          detail:
            "Choose the scholarship, the student, their fee, and the fee items the discount applies to. Leaving the items empty applies it to the fee as a whole.",
        },
        {
          title: "Grant it",
          detail:
            "Press Grant Scholarship. The discount lands on the fee items immediately, so the dues and the installments drop at once.",
        },
        {
          title: "Revoke it",
          detail:
            "Granted Scholarships → row menu Revoke. Revoking is refused once a payment has been allocated against the discounted fee; cancel or adjust the payment first.",
        },
      ],
    },

    // ── Payroll ────────────────────────────────────────────────────────────
    {
      module: "Payroll",
      question: "How do I set a teacher's extra class pay (batch pay)?",
      steps: [
        {
          title: "Open Batch Pay",
          detail:
            "Batch Pay → New Batch Pay. Batch pay is extra pay for one class on top of the base salary.",
        },
        {
          title: "Pick the class",
          detail:
            "Choose the teaching assignment (the batch, term and subject the teacher handles), the amount or rate, and the period it applies to.",
        },
        {
          title: "It reaches the payslip",
          detail:
            "The accountant adds it to the payroll as Teaching pay. The teacher sees the same rows read-only on their Batch Pay page.",
        },
      ],
    },

    // ── Notices ────────────────────────────────────────────────────────────
    {
      module: "Notices",
      question: "How do I publish a notice?",
      steps: [
        {
          title: "Open Notices",
          detail:
            "Notices → New Notice. Give the notice a title and a body; the body is what people read in the bell and on the notices page.",
        },
        {
          title: "Choose the audience",
          detail:
            "Everybody, a role, or a class. The audience decides who sees it; a notice is never visible to people outside it.",
        },
        {
          title: "Publish it",
          detail:
            "Saving publishes the notice instantly. It appears in the notification bell of the audience and on their Notices page, newest first.",
        },
      ],
    },

    // ── System ─────────────────────────────────────────────────────────────
    {
      module: "System",
      question: "How do I add holidays and weekly offs?",
      steps: [
        {
          title: "Open Holidays",
          detail:
            "System → Holidays. The calendar and the table show the same holidays; use whichever view you prefer.",
        },
        {
          title: "Add the holiday",
          detail:
            "Pick a single date, a date range, or several dates at once. Give it a name, a type (Public, School or Weekly) and say whether it applies to employees, students or both.",
        },
        {
          title: "Generate the weekly off",
          detail:
            "Use the weekday generator to create every Saturday (or whichever day the college closes) for a whole range instead of adding them one by one.",
        },
        {
          title: "What it affects",
          detail:
            "Holidays block attendance sheets for that date and are excluded from payroll working days depending on the working-days setting.",
        },
      ],
    },
    {
      module: "System",
      question: "How do I create a fiscal year?",
      steps: [
        {
          title: "Open Fiscal years",
          detail:
            "System → Fiscal years → New Fiscal Year. A fiscal year is the accounting year used by payments and payroll.",
        },
        {
          title: "Fill the BS period",
          detail:
            "Name it the way the college does (for example 2082/83), then set the BS start and end dates.",
        },
        {
          title: "Mark the current one",
          detail:
            "Switch on Current for the year in use, and Closed when it is finished. Payroll asks for a fiscal year, so at least one current year must exist before the first run.",
        },
      ],
    },
    {
      module: "System",
      question: "How do I change the college settings?",
      steps: [
        {
          title: "Open Settings",
          detail:
            "System → Settings. The page is split into College, Attendance, Payroll and Fees; each section has its own Save.",
        },
        {
          title: "College identity",
          detail:
            "Name, address, affiliation, email, phone, website, since year, programmes, PAN, logo URL, signature URL and signature label. The logo and signature previews show what the ID card will print.",
        },
        {
          title: "Behaviour settings",
          detail:
            "Attendance controls the edit window; Payroll controls how working days are counted; Fees controls auto-assign on admission, the receipt prefix and the due dates.",
        },
        {
          title: "Save the section",
          detail:
            "Only the changed keys are sent. The principal can edit the College section from Principal → College Settings; the other sections stay read-only for the principal.",
        },
      ],
    },
    {
      module: "System",
      question: "How do I see who changed what?",
      steps: [
        {
          title: "Open the audit log",
          detail:
            "System → Audit log. Every privileged change is recorded with the action, the entity and its id, the actor and the time.",
        },
        {
          title: "Narrow the list",
          detail:
            "Search by entity id or actor, or scan by action. Use it to answer questions such as who changed a fee, approved a student or reversed a payment.",
        },
      ],
    },
  ],

  PRINCIPAL: [
    // ── Getting started ────────────────────────────────────────────────────
    {
      module: "Getting started",
      question: "How do I get an overview of the college?",
      steps: [
        {
          title: "Read the dashboard",
          detail:
            "Your dashboard collects the numbers and the items waiting for you: students to approve, results to review, payroll to approve and the latest notices.",
        },
        {
          title: "Use Reports for totals",
          detail:
            "Reports shows the number of students, employees, attendance records and fee payments, plus a chart of the same counts. It is a quick health check, not a detailed statement.",
        },
        {
          title: "Watch the bell",
          detail:
            "The notification bell in the header shows new notices and the alerts that concern you. Ctrl + K jumps to any page your role can open.",
        },
      ],
    },

    // ── Students ───────────────────────────────────────────────────────────
    {
      module: "Students",
      question: "How do I approve a student?",
      steps: [
        {
          title: "Open Student Approval",
          detail:
            "Students → Student Approval lists the students waiting for approval, including the ones teachers added.",
        },
        {
          title: "Approve the row",
          detail:
            "Open the row menu and press Approve. Approval makes the student active and assigns the college fee of their batch automatically.",
        },
        {
          title: "Check the fee warning",
          detail:
            "If the batch has no fee structure, the approval still succeeds but the fee is not assigned. Ask the accountant to assign it from Fee Structures.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I reject a student?",
      steps: [
        {
          title: "Choose Reject",
          detail:
            "Student Approval → row menu Reject. A reason is required and is shown to the person who added the student.",
        },
        {
          title: "Write a clear reason",
          detail:
            "Say exactly what is missing or wrong (for example the batch, the guardian phone or the documents). The reason is recorded in the audit trail.",
        },
        {
          title: "Correct and re-approve",
          detail:
            "The student can be edited afterwards and approved once the record is right. A rejection does not delete the student.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I look up a student or print an ID card?",
      steps: [
        {
          title: "Open the student directory",
          detail:
            "Students lists the college students. Search by name, registration number or email, and filter by batch, status or approval state.",
        },
        {
          title: "Open the card",
          detail:
            "Row menu → ID Card. The card uses the student's real data and the college identity, and stays white in both themes.",
        },
        {
          title: "Press Print",
          detail:
            "Only the CR80 card is printed, not the page around it. If the logo or address is wrong, fix it in College Settings and print again.",
        },
      ],
    },

    // ── Academics ──────────────────────────────────────────────────────────
    {
      module: "Academics",
      question: "How do I review the academic setup?",
      steps: [
        {
          title: "Browse the tree",
          detail:
            "Academics → Courses, Batches, Terms and Subjects show how the college is structured. The pages are read-only for you; the admin makes the changes.",
        },
        {
          title: "Check who teaches what",
          detail:
            "Teaching Assignments shows every batch → term → subject → teacher link. Class Schedules shows the weekly timetable those assignments produce.",
        },
        {
          title: "Check the term subjects",
          detail:
            "Terms → click a term name opens its Term Subjects list, with credit hours and the elective flags. This is what the exams and the results are built on.",
        },
      ],
    },

    // ── Results ────────────────────────────────────────────────────────────
    {
      module: "Results",
      question: "How do I review the results teachers submitted?",
      steps: [
        {
          title: "Open Pending Results",
          detail:
            "Results → Pending Results. The groups are organised by batch and term; filter by batch, term, subject or status to focus.",
        },
        {
          title: "Open a group",
          detail:
            "Each group lists the subjects and their status. A subject is PENDING while it waits for you, and shows how many students were marked.",
        },
        {
          title: "Approve or reject",
          detail:
            "Approve a subject when the marks look right. Reject it with a reason when they do not; the teacher sees the reason and can fix and resubmit.",
        },
      ],
    },
    {
      module: "Results",
      question: "How do I publish results?",
      steps: [
        {
          title: "Open Publish Results",
          detail:
            "Results → Publish Results. Only groups whose subjects are all approved are ready to publish.",
        },
        {
          title: "Publish the group",
          detail:
            "Press Publish on the batch + term group. Publishing makes the approved results final and visible as results rather than drafts.",
        },
        {
          title: "Check before publishing",
          detail:
            "Publishing is the last step. If a subject is still pending or rejected, the group stays blocked until it is approved.",
        },
      ],
    },
    {
      module: "Results",
      question: "What happens when I reject a result?",
      steps: [
        {
          title: "The teacher is notified",
          detail:
            "The subject moves to REJECTED in the teacher's Marks Submission page together with your reason.",
        },
        {
          title: "The teacher fixes the marks",
          detail:
            "They open Marks Entry, correct the sheet and submit it again. The subject comes back to Pending Results for you.",
        },
        {
          title: "You approve the resubmission",
          detail:
            "The cycle repeats until the marks are correct. Nothing is published until you approve and then publish the group.",
        },
      ],
    },

    // ── Payroll ────────────────────────────────────────────────────────────
    {
      module: "Payroll",
      question: "How do I approve the payroll?",
      steps: [
        {
          title: "Open Pending Payroll",
          detail:
            "Pending Payroll lists the months the accountant submitted, with the number of payslips and the totals.",
        },
        {
          title: "Check the payslips",
          detail:
            "Open the month and review the payslips: basic, attendance deduction, allowances, teaching pay, tax and net. Compare a few with the salary structure and the attendance.",
        },
        {
          title: "Approve",
          detail:
            "Approve the payroll. The accountant can now mark it as paid, which posts the payroll journal and locks that month's employee attendance.",
        },
      ],
    },
    {
      module: "Payroll",
      question: "How do I reject the payroll?",
      steps: [
        {
          title: "Reject with a remark",
          detail:
            "Pending Payroll → Reject. Say what is wrong (a missing employee, a wrong deduction, a batch pay that was not included).",
        },
        {
          title: "The accountant fixes it",
          detail:
            "The payroll returns to them as REJECTED. They correct it and submit it again for your approval.",
        },
        {
          title: "Nothing is paid on rejection",
          detail:
            "A rejected payroll cannot be marked as paid, so no journal is posted and no attendance is locked.",
        },
      ],
    },

    // ── Attendance ─────────────────────────────────────────────────────────
    {
      module: "Attendance",
      question: "How do I check employee attendance?",
      steps: [
        {
          title: "Open Employee Attendance",
          detail:
            "Employee Attendance. The page lists the employee attendance records with the employee, designation, date and status.",
        },
        {
          title: "Filter the view",
          detail:
            "Pick an employee, a BS date or a status (Present, Absent, Late, Leave) to narrow the list. The page is a read-only view.",
        },
        {
          title: "Who marks it",
          detail:
            "The accountant marks employee attendance from their Attendance page. Ask them to add or correct a day; you review the result here.",
        },
      ],
    },
    {
      module: "Attendance",
      question: "How does employee attendance affect the salary?",
      steps: [
        {
          title: "It decides the earned basic",
          detail:
            "The payroll counts the present days (and the paid leave) of the month. A day that is absent without leave reduces the earned basic salary.",
        },
        {
          title: "Leave is counted separately",
          detail:
            "A LEAVE day needs a leave type. Paid leave does not cut the salary; unpaid leave behaves like an absence.",
        },
        {
          title: "Paid payroll locks the month",
          detail:
            "Once a payroll is marked as paid, that month's attendance is locked. Correct any mistake before you approve and pay the month.",
        },
      ],
    },

    // ── Scholarships ───────────────────────────────────────────────────────
    {
      module: "Scholarships",
      question: "How do I see the scholarships that were granted?",
      steps: [
        {
          title: "Open Granted Scholarships",
          detail:
            "Scholarships → Granted Scholarships lists every grant with the student, the scheme, the amount and the fee item it discounted.",
        },
        {
          title: "Read it as a register",
          detail:
            "The view is read-only for you. It is the audit trail of what the college gave and when.",
        },
        {
          title: "Revoking is the accountant's job",
          detail:
            "If a grant is wrong, ask the accountant to revoke it. Revoking is refused once a payment has been allocated against that fee.",
        },
      ],
    },

    // ── Reports ────────────────────────────────────────────────────────────
    {
      module: "Reports",
      question: "How do I read the reports?",
      steps: [
        {
          title: "Open Reports",
          detail:
            "Reports shows four totals — students, employees, attendance records and fee payments — and a bar chart of the same numbers.",
        },
        {
          title: "Use it as a health check",
          detail:
            "It is a count of records, not a financial statement. For fees and payroll detail use the accountant's pages; for results use Pending/Publish Results.",
        },
        {
          title: "Refresh after changes",
          detail:
            "The cards load on their own. Reload the page to see the numbers after a large import or a payroll run.",
        },
      ],
    },

    // ── Settings ───────────────────────────────────────────────────────────
    {
      module: "Settings",
      question: "How do I edit the college identity on ID cards?",
      steps: [
        {
          title: "Open College Settings",
          detail:
            "Principal → College Settings. The College section is the only section you can edit; the other sections show the admin's values read-only.",
        },
        {
          title: "Fill the identity",
          detail:
            "College name, address, affiliation, email, phone, website, since year, programmes, PAN, logo URL, signature URL and the signature label. The logo and signature previews appear right below the fields.",
        },
        {
          title: "Save the section",
          detail:
            "Press Save College. The ID cards and the institution endpoint pick the new values up, so the next card you open prints with them.",
        },
      ],
    },

    // ── Notices ────────────────────────────────────────────────────────────
    {
      module: "Notices",
      question: "How do I send a notice to the college?",
      steps: [
        {
          title: "Open Notices",
          detail:
            "Notices → New Notice. Give it a title and the body people will read.",
        },
        {
          title: "Choose who sees it",
          detail:
            "Leave the audience on Everybody, or target selected roles and classes. A notice never reaches anybody outside the chosen audience.",
        },
        {
          title: "Publish",
          detail:
            "Saving publishes it to the notification bell and the Notices page of the audience. The list shows the newest first.",
        },
      ],
    },
  ],

  ACCOUNTANT: [
    // ── Getting started ────────────────────────────────────────────────────
    {
      module: "Getting started",
      question: "What do I own and in what order do I set it up?",
      steps: [
        {
          title: "The money modules",
          detail:
            "You own fee structures, student fees, payments and receipts, installments, scholarships and grants, batch pay, payroll, employee attendance, journal and ledgers.",
        },
        {
          title: "Get the inputs first",
          detail:
            "The admin creates the fiscal year, the fee heads and the academic tree (courses, batches, terms, subjects). You cannot assign a fee to a batch that does not exist.",
        },
        {
          title: "Then the order",
          detail:
            "Fee structures → assign to students/batches → payments and installments → scholarships → employee attendance → payroll → journal and ledgers.",
        },
      ],
    },

    // ── Finance ────────────────────────────────────────────────────────────
    {
      module: "Finance",
      question: "How do I create a fee structure?",
      steps: [
        {
          title: "Open Fee Structures",
          detail:
            "Finance → Fee Structures → New Fee Structure. A structure is the price list of a course, optionally narrowed to one batch.",
        },
        {
          title: "Pick the scope",
          detail:
            "Choose the course and, if the price differs for an intake, the batch. A batch structure overrides the course default for that batch.",
        },
        {
          title: "Add the fee items",
          detail:
            "For each item pick a fee head (from Lookups), enter the amount and choose whether it is one-time or charged per term. Add as many rows as the college needs.",
        },
        {
          title: "Save and assign",
          detail:
            "Saving the structure does not charge anybody. Assign it from the list with Assign Student or Assign Batch.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I assign a fee structure to a student?",
      steps: [
        {
          title: "Open the structure",
          detail:
            "Fee Structures → row action Assign Student. Pick the student who should receive this price list.",
        },
        {
          title: "Confirm",
          detail:
            "Saving copies the fee items to the student as a student fee. That is what makes the dues visible on Student Fees and lets you record a payment.",
        },
        {
          title: "Avoid duplicates",
          detail:
            "Assigning the same structure twice does not create a second fee. If the student already has a different fee, decide which one is right before assigning.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I assign a fee structure to a whole batch?",
      steps: [
        {
          title: "Open Assign Batch",
          detail:
            "Fee Structures → row action Assign Batch. Pick the batch whose students should receive this structure.",
        },
        {
          title: "It applies to every student",
          detail:
            "Every student of that batch without this fee gets it in one go. Students who already have it are skipped.",
        },
        {
          title: "Check the result",
          detail:
            "Open Student Fees and filter by the batch to see the student fees and their dues. New students approved later get the structure automatically if auto-assign is on.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I record a fee payment?",
      steps: [
        {
          title: "Open Record Payment",
          detail:
            "Finance → Student Fees → Record Payment. Start by picking the fiscal year and the student.",
        },
        {
          title: "Pick the student fee",
          detail:
            "The student's fees are listed with their items, discounts and net amounts. Choose the fee (and the item) the money belongs to.",
        },
        {
          title: "Allocate the amount",
          detail:
            "Enter the amount paid, split it over the fee items when needed, choose the payment method and the BS payment date. The unallocated part is not saved.",
        },
        {
          title: "Save and print",
          detail:
            "Saving generates the receipt number. Open the receipt to print it; the same payment appears on Student Fees and Fee Payments.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I print or reprint a receipt?",
      steps: [
        {
          title: "Find the payment",
          detail:
            "Finance → Fee Payments lists the payments; click a payment to open its printable receipt. The student's fee page links to the same receipts.",
        },
        {
          title: "Open the receipt",
          detail:
            "Click the receipt number / row to open the printable receipt. It shows the college identity, the student, the allocation and the amount in words.",
        },
        {
          title: "Print",
          detail:
            "Press Print. Only the receipt is printed. Reprinting does not create a new payment; the same receipt number is reused.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I cancel a payment or a receipt?",
      steps: [
        {
          title: "Open Payments & Receipts",
          detail:
            "Finance → Receipts lists every receipt and its status. A cancelled receipt stays in the list, marked CANCELLED.",
        },
        {
          title: "Cancel with a reason",
          detail:
            "Press Cancel on the row and give the reason. Cancellation is append-only: the original is reversed, never silently deleted, so the audit trail stays complete.",
        },
        {
          title: "Check the student's dues",
          detail:
            "After cancelling, the amount returns to the student's dues. Tell the student and record a new payment if the money was actually received.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I see a student's installment plan?",
      steps: [
        {
          title: "Open Installments",
          detail:
            "Finance → Installments lists the installments of the student fees: the number, the due date (BS), the amount and the paid/pending state.",
        },
        {
          title: "Read one fee",
          detail:
            "Filter by student or fee to see the whole plan. Each row is one installment of one fee item.",
        },
        {
          title: "Keep it in step with payments",
          detail:
            "Recording a payment against a fee updates the paid amounts. If a plan is wrong, fix the fee before taking more money.",
        },
      ],
    },
    {
      module: "Finance",
      question: "How do I post a journal entry?",
      steps: [
        {
          title: "Open Journal",
          detail:
            "Finance → Journal → New entry. Use it for adjustments that do not come from a fee payment or a payroll.",
        },
        {
          title: "Add the lines",
          detail:
            "Choose the BS date, write a narration, then add debit and credit lines with the account, the amount and an optional description.",
        },
        {
          title: "Balance and post",
          detail:
            "The total debits must equal the total credits. Posting is refused otherwise, and a posted entry is reversed rather than edited.",
        },
        {
          title: "See the ledgers",
          detail:
            "Finance → Ledgers shows the running balance of every account; use it to check the entry landed where you meant.",
        },
      ],
    },

    // ── Scholarships ───────────────────────────────────────────────────────
    {
      module: "Scholarships",
      question: "How do I create a scholarship scheme?",
      steps: [
        {
          title: "Open Scholarship Schemes",
          detail:
            "Scholarships → Scholarship Schemes → New Scholarship Scheme. The scheme stores the rule: a percentage or a fixed amount.",
        },
        {
          title: "Fill the rule",
          detail:
            "Name, code, type (Percent or Fixed), value, an optional description and the active flag. A percent of 25, for example, takes a quarter off the chosen items.",
        },
        {
          title: "Grant it separately",
          detail:
            "The scheme itself gives nothing. Grant it to a student from Granted Scholarships.",
        },
      ],
    },
    {
      module: "Scholarships",
      question: "How do I grant or revoke a scholarship?",
      steps: [
        {
          title: "Grant it",
          detail:
            "Scholarships → Granted Scholarships → Grant Scholarship. Pick the scheme, the student, their fee and the fee items to discount.",
        },
        {
          title: "The dues drop at once",
          detail:
            "The discount is written on the fee items, so the student's net due and the installments change immediately. Only students who already have a fee can receive one.",
        },
        {
          title: "Revoke it",
          detail:
            "Granted Scholarships → row menu Revoke. It removes the discount from every item of that grant and keeps the record for the audit trail.",
        },
        {
          title: "When revoking is blocked",
          detail:
            "A grant cannot be revoked once a payment has been allocated to the discounted fee. Cancel or adjust the payment first, then revoke.",
        },
      ],
    },

    // ── Attendance ─────────────────────────────────────────────────────────
    {
      module: "Attendance",
      question: "How do I mark employee attendance?",
      steps: [
        {
          title: "Open Attendance",
          detail:
            "Attendance. This is the page with the Save form; the principal's Employee Attendance page is only a read-only view.",
        },
        {
          title: "Pick the employee and the date",
          detail:
            "Choose the employee and the BS date. A date that is a holiday or already locked cannot be edited.",
        },
        {
          title: "Set the status",
          detail:
            "Present, Absent, Late or Leave. A LEAVE day requires a leave type (from the admin's Lookups → Leave types); without it the Save stays disabled.",
        },
        {
          title: "Save",
          detail:
            "Press Save. The record feeds the payroll: present and paid leave count, unpaid leave and absence do not. The list below shows the saved records.",
        },
      ],
    },
    {
      module: "Attendance",
      question: "How do I review a month of employee attendance?",
      steps: [
        {
          title: "Filter the list",
          detail:
            "Attendance → filter by employee, BS date and status. The table is the same data the payroll counts.",
        },
        {
          title: "Fix before payroll",
          detail:
            "Correct a day while the payroll is still DRAFT. Once the payroll is paid the month is locked and the record cannot be changed.",
        },
        {
          title: "Tell the principal",
          detail:
            "The principal reviews the same records on Employee Attendance. If they ask about a day, point them to the employee and the date.",
        },
      ],
    },

    // ── Payroll ────────────────────────────────────────────────────────────
    {
      module: "Payroll",
      question: "How do I create the monthly payroll?",
      steps: [
        {
          title: "Open Payroll",
          detail:
            "Payroll → Create Payroll. Pick the fiscal year, the BS year and the BS month the payslips belong to.",
        },
        {
          title: "It builds the payslips",
          detail:
            "Saving creates a DRAFT payroll and generates a payslip for every employee from the salary structures, the employee attendance and the batch pay.",
        },
        {
          title: "Check it",
          detail:
            "Open the payroll and read the payslips. If something is wrong, fix the attendance or the batch pay while it is still DRAFT; a draft can be regenerated.",
        },
      ],
    },
    {
      module: "Payroll",
      question: "How do I submit the payroll for approval?",
      steps: [
        {
          title: "Submit the draft",
          detail:
            "Payroll → row action Submit. The status moves from DRAFT to PENDING and the principal sees it on Pending Payroll.",
        },
        {
          title: "Wait for the decision",
          detail:
            "You cannot pay a PENDING payroll. The principal approves or rejects it with a remark.",
        },
        {
          title: "If it is rejected",
          detail:
            "The payroll returns as REJECTED with the reason. Correct it and submit it again; the cycle repeats until it is approved.",
        },
      ],
    },
    {
      module: "Payroll",
      question: "How do I pay an approved payroll?",
      steps: [
        {
          title: "Open the approved month",
          detail:
            "Payroll → the row whose status is APPROVED → Pay. A PENDING month cannot be paid; it must be approved first.",
        },
        {
          title: "Set the paid date",
          detail:
            "Choose the BS date the salaries were paid. This date is written on the payslips and in the journal.",
        },
        {
          title: "What paying does",
          detail:
            "Confirm Pay marks the payroll PAID, posts the payroll journal and locks that month's employee attendance. It cannot be undone, so check the date first.",
        },
      ],
    },
    {
      module: "Payroll",
      question: "How do I set a teacher's extra class pay (batch pay)?",
      steps: [
        {
          title: "Open Batch Pay",
          detail:
            "Batch Pay → New Batch Pay. Batch pay is the extra pay for one teaching assignment on top of the base salary.",
        },
        {
          title: "Pick the class and the amount",
          detail:
            "Choose the teaching assignment, the amount or rate and the period it covers. A teacher can have several batch pays, one per class.",
        },
        {
          title: "It lands on the payslip",
          detail:
            "The next payroll adds it as Teaching pay. The teacher sees the same rows read-only on their Batch Pay page.",
        },
      ],
    },

    // ── Notices ────────────────────────────────────────────────────────────
    {
      module: "Notices",
      question: "How do I publish a notice?",
      steps: [
        {
          title: "Open Notices",
          detail:
            "Notices → New Notice. Give it a title and a body.",
        },
        {
          title: "Choose the audience",
          detail:
            "Everybody, a role, or a class. You can address the whole college, the staff, the teachers or the students of one class.",
        },
        {
          title: "Publish",
          detail:
            "Saving publishes it to the bell and the Notices page of the audience. The newest notice appears first.",
        },
      ],
    },
  ],

  TEACHER: [
    // ── Getting started ────────────────────────────────────────────────────
    {
      module: "Getting started",
      question: "How do I find my classes and my timetable?",
      steps: [
        {
          title: "Open My Classes",
          detail:
            "My Classes lists every teaching assignment you have: the batch, the term, the subject, the students and the period.",
        },
        {
          title: "Open My Calendar",
          detail:
            "My Calendar shows the same classes on the weekly timetable, with the periods and rooms the admin scheduled.",
        },
        {
          title: "Use the dashboard",
          detail:
            "Your dashboard collects the classes, students, attendance percentage, pending attendance and pending marks. Ctrl + K jumps to any page.",
        },
      ],
    },

    // ── My teaching ────────────────────────────────────────────────────────
    {
      module: "My teaching",
      question: "How do I take the attendance of my class?",
      steps: [
        {
          title: "Open Take Attendance",
          detail:
            "Attendance → Take Attendance. The date defaults to today in BS; pick the class and the period from your own teaching assignments.",
        },
        {
          title: "Mark the sheet",
          detail:
            "Mark every student present, absent, late or on leave. The bulk button marks everybody present so you only change the exceptions.",
        },
        {
          title: "Add the remarks",
          detail:
            "A student on leave needs a remark; the Save stays blocked until every leave row has one.",
        },
        {
          title: "Save",
          detail:
            "Press Save. The session is stored and the student's attendance percentage updates. A holiday or a locked session cannot be saved.",
        },
      ],
    },
    {
      module: "My teaching",
      question: "How do I fix attendance I already saved?",
      steps: [
        {
          title: "Open Attendance Sessions",
          detail:
            "Attendance → Attendance Sessions lists the sessions you saved, newest first. Open the class and the date you want to correct.",
        },
        {
          title: "Edit before the lock",
          detail:
            "The college setting 'attendance edit window' allows corrections for a number of hours after the session. Within that window, reopen and save the corrected sheet.",
        },
        {
          title: "After the lock",
          detail:
            "Once the window has passed the session is read-only. Ask the admin to change the setting or to correct the record; you cannot edit it yourself.",
        },
      ],
    },
    {
      module: "My teaching",
      question: "How do I see the attendance of my students?",
      steps: [
        {
          title: "Open Students",
          detail:
            "Students lists the students of the classes you teach. Search by name or registration number and open a student to see the details.",
        },
        {
          title: "Check the percentage",
          detail:
            "The student page and your dashboard show the attendance percentage. The dashboard's low-attendance list names the students below the threshold.",
        },
        {
          title: "Check a session",
          detail:
            "Attendance Sessions shows what was marked on a given day, so you can explain a percentage to a student or a guardian.",
        },
      ],
    },

    // ── Exams ──────────────────────────────────────────────────────────────
    {
      module: "Exams",
      question: "How do I create an exam?",
      steps: [
        {
          title: "Open Exams",
          detail:
            "Exams → New Exam. Pick the batch term (the class and term), the exam type and give the exam a name.",
        },
        {
          title: "Fill the dates",
          detail:
            "The BS start and end dates are optional but recommended. The end date must be on or after the start date.",
        },
        {
          title: "Add the subjects",
          detail:
            "Saving creates the exam only. Add your subject from Exam Subjects: pick the exam and the batch-term subject, then set the full marks, the pass marks and the exam date.",
        },
      ],
    },
    {
      module: "Exams",
      question: "How do I add my subject to an exam?",
      steps: [
        {
          title: "Open Exam Subjects",
          detail:
            "Exams → Exam Subjects → New. Only the batch-term subjects of the classes you teach are listed.",
        },
        {
          title: "Choose the exam and the subject",
          detail:
            "Pick the exam, then the batch-term subject (the subject already assigned to that term).",
        },
        {
          title: "Set the marks",
          detail:
            "Enter the full marks, the pass marks and the exam date (BS). These numbers decide the marks sheet and the pass/fail calculation.",
        },
      ],
    },
    {
      module: "Exams",
      question: "How do I enter the marks?",
      steps: [
        {
          title: "Open Marks Entry",
          detail:
            "Exams → Marks Entry, or the Marks Entry action on a row. Pick the exam and then the exam subject; the students of the class appear in a grid.",
        },
        {
          title: "Fill the sheet",
          detail:
            "Type each student's marks. An absent student is marked absent instead of a number. You can move down the rows with the arrow keys.",
        },
        {
          title: "Save",
          detail:
            "Press Save. A sheet cannot be saved with a student missing a mark or an absent flag; the page tells you how many are still missing.",
        },
      ],
    },

    // ── Results ────────────────────────────────────────────────────────────
    {
      module: "Results",
      question: "How do I submit marks to the principal?",
      steps: [
        {
          title: "Open Marks Submission",
          detail:
            "Exams → Marks Submission. Each subject of yours is a row with its status and the reason if it was rejected.",
        },
        {
          title: "Enter what is missing",
          detail:
            "A subject needs a mark or an Absent flag for every student before it can be submitted. Enter marks from the Marks Entry link if the sheet is incomplete.",
        },
        {
          title: "Submit",
          detail:
            "Press Submit on the subject. It moves to PENDING and waits for the principal. Approved subjects turn APPROVED and need nothing more.",
        },
      ],
    },
    {
      module: "Results",
      question: "How do I generate a result?",
      steps: [
        {
          title: "Open Results",
          detail:
            "Results page → Generate. Pick the exam and the student; the result is built from the marks of every exam subject of that exam.",
        },
        {
          title: "Check the outcome",
          detail:
            "The generated result shows the total, the percentage or GPA, the pass/fail state and the subject breakdown. Open a result to see the detail.",
        },
        {
          title: "Generate per student",
          detail:
            "Repeat for every student of the class. The generated results are what the principal approves and publishes.",
        },
      ],
    },
    {
      module: "Results",
      question: "What happens if the principal rejects my submission?",
      steps: [
        {
          title: "Read the reason",
          detail:
            "Marks Submission shows the subject as REJECTED with the principal's remark. The rejection is about the marks, not about you.",
        },
        {
          title: "Fix the marks",
          detail:
            "Open Marks Entry for that exam subject, correct the marks or the absent flags, and save the sheet again.",
        },
        {
          title: "Submit again",
          detail:
            "Press Submit on the row. The subject returns to PENDING and the principal reviews it again.",
        },
      ],
    },

    // ── Students ───────────────────────────────────────────────────────────
    {
      module: "Students",
      question: "How do I see the students of my class?",
      steps: [
        {
          title: "Open Students",
          detail:
            "Students lists only the students of the classes you teach. Search by name or registration number.",
        },
        {
          title: "Open a student",
          detail:
            "The student page shows the personal details, the guardians and the attendance summary. You cannot see students of other teachers.",
        },
        {
          title: "Use your dashboard",
          detail:
            "The dashboard groups the class count, the student count and the low-attendance students for the day.",
        },
      ],
    },
    {
      module: "Students",
      question: "How do I add a student to my class?",
      steps: [
        {
          title: "Open the admission form",
          detail:
            "Students → Add Student. Fill the personal, guardian and batch details; the batch picker is limited to the classes you teach.",
        },
        {
          title: "The student starts pending",
          detail:
            "Saving creates the student as PENDING. They are not active and have no fee yet.",
        },
        {
          title: "An admin or the principal approves",
          detail:
            "The approval assigns the college fee. You can keep teaching the student once the record is approved; ask the office to approve it if it stays pending.",
        },
      ],
    },

    // ── Payroll ────────────────────────────────────────────────────────────
    {
      module: "Payroll",
      question: "Where do I see my extra class pay (batch pay)?",
      steps: [
        {
          title: "Open Batch Pay",
          detail:
            "Batch Pay lists the extra pay of each of your classes, with the amount and the period it applies to.",
        },
        {
          title: "It is read-only",
          detail:
            "The accountant sets the amount. You cannot change it; tell the accountant if a class or a period is wrong.",
        },
        {
          title: "It lands on the payslip",
          detail:
            "The amount is added to the payroll as Teaching pay. Your payslip is issued by the accountant's payroll run.",
        },
      ],
    },

    // ── Notices ────────────────────────────────────────────────────────────
    {
      module: "Notices",
      question: "How do I notify my class?",
      steps: [
        {
          title: "Open Notices",
          detail:
            "Notices → New Notice. The audience picker only offers the classes you teach.",
        },
        {
          title: "Write it",
          detail:
            "Give the notice a title and a body. Keep it short; it is read in the notification bell and on the notices page.",
        },
        {
          title: "Send",
          detail:
            "Saving publishes the notice to the students of that class. A teacher can never address the whole college.",
        },
      ],
    },
  ],

  STAFF: [
    // ── Getting started ────────────────────────────────────────────────────
    {
      module: "Getting started",
      question: "How do I move around and change the theme?",
      steps: [
        {
          title: "Use the command palette",
          detail:
            "Ctrl + K (⌘ + K on macOS) lists every page your role can open, the quick actions and the theme switch.",
        },
        {
          title: "Use the header",
          detail:
            "The theme toggle in the header switches between light, dark and the system theme. The bell next to it shows your notices and alerts.",
        },
        {
          title: "Open Help",
          detail:
            "Help → My role explains what a staff account can do; Help → How do I...? is this list of workflows.",
        },
      ],
    },

    // ── My profile ─────────────────────────────────────────────────────────
    {
      module: "My profile",
      question: "How do I update my profile?",
      steps: [
        {
          title: "Open My Profile",
          detail:
            "My Profile shows your employee details: the code, the designation, the department, the join date and your contact information.",
        },
        {
          title: "Edit it",
          detail:
            "Press Edit Profile. You can change your first and last name, phone, address and department.",
        },
        {
          title: "Save",
          detail:
            "Press Save. The change is immediate and the profile page shows the new values. Your email, role and designation are managed by the admin.",
        },
      ],
    },
    {
      module: "My profile",
      question: "How do I change my name or phone number?",
      steps: [
        {
          title: "Edit the profile",
          detail:
            "My Profile → Edit Profile. The name, phone, address and department are the fields you own.",
        },
        {
          title: "Save and check",
          detail:
            "Saving updates your record in the employee directory. The payroll uses the same record, so keep the name and the bank details correct.",
        },
        {
          title: "Ask for the rest",
          detail:
            "The employee code, designation, role, join date and bank details are changed by the admin from Employees.",
        },
      ],
    },

    // ── Attendance ─────────────────────────────────────────────────────────
    {
      module: "Attendance",
      question: "How do I check my attendance?",
      steps: [
        {
          title: "Open My Attendance",
          detail:
            "My Attendance shows your month with the marked days: present, absent, late and leave.",
        },
        {
          title: "Read a day",
          detail:
            "Each row shows the BS date and the status. Leave rows also show the leave type and any remark.",
        },
        {
          title: "Question a day",
          detail:
            "The accountant marks employee attendance. If a day is wrong, ask them to correct it before the month's payroll is paid (after that the month is locked).",
        },
      ],
    },
    {
      module: "Attendance",
      question: "How do I apply for leave?",
      steps: [
        {
          title: "Open My Leave",
          detail:
            "My Leave. The form at the top is the leave application; the table below is your history.",
        },
        {
          title: "Fill the request",
          detail:
            "Pick the BS date, the leave type (optional) and a remark. The date and the type are what the payroll uses.",
        },
        {
          title: "Apply",
          detail:
            "Press Apply Leave. The request is recorded as a LEAVE day and appears in the list right away.",
        },
      ],
    },
    {
      module: "Attendance",
      question: "How do I see my leave history?",
      steps: [
        {
          title: "Open My Leave",
          detail:
            "The table under the form lists every leave you applied for, with the date, the type, the remark and the LEAVE status.",
        },
        {
          title: "Search it",
          detail:
            "Use the table's search and paging to find an older leave. The list is the same data the payroll counts.",
        },
        {
          title: "Ask about a correction",
          detail:
            "A leave that was entered wrongly is corrected by the accountant; you can apply again for the right date.",
        },
      ],
    },

    // ── Payroll ────────────────────────────────────────────────────────────
    {
      module: "Payroll",
      question: "How do I see my payslip?",
      steps: [
        {
          title: "Open My Payslips",
          detail:
            "My Payslips lists the payslip of every month the payroll was run for you.",
        },
        {
          title: "Open a month",
          detail:
            "The payslip breaks down the basic salary, the attendance deduction, the allowances, the teaching pay (if any), the tax and the net pay.",
        },
        {
          title: "Print it",
          detail:
            "The payslip detail can be printed. If a month is missing, the accountant has not paid that payroll yet.",
        },
      ],
    },

    // ── Notices ────────────────────────────────────────────────────────────
    {
      module: "Notices",
      question: "How do I read the notices of the college?",
      steps: [
        {
          title: "Open Notices",
          detail:
            "Notices lists every notice addressed to the staff, newest first.",
        },
        {
          title: "Use the bell",
          detail:
            "The bell in the header shows the new notices and the alerts that concern you, so you do not have to open the page every time.",
        },
        {
          title: "Read the audience",
          detail:
            "A notice can be for everybody, for a role or for a class. The ones you see are the ones meant for you.",
        },
      ],
    },
  ],
};
