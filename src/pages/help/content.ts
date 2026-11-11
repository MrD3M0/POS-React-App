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
      "pnpm db:seed:all   (creates the demo accounts and the academic setup)",
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
    what: "Admission and student records: personal details, guardians, batch, status and approval. A teacher can add a student, an admin approves them.",
    roles: "Admin (full), Principal (read + approve), Teacher (own students)",
  },
  {
    name: "Academic structure",
    what: "The course → batch → term → subject tree that everything else hangs on: teaching assignments (who teaches what), subjects and their credit hours.",
    roles: "Admin (manage), others (read)",
  },
  {
    name: "Attendance",
    what: "Daily student attendance per class (teacher marks it on the sheet) and employee attendance (principal marks it). Attendance feeds the attendance % and the low-attendance list.",
    roles: "Teacher (students), Principal (employees)",
  },
  {
    name: "Exams & results",
    what: "Exam subjects, marks entry, result calculation with GPA and pass rate, principal approval and publishing.",
    roles: "Teacher (marks + results), Principal (approve + publish)",
  },
  {
    name: "Fees",
    what: "Fee heads, fee structures (per course, with an optional batch override), assignment of a fee to a student or a whole batch, installments, payments and receipts.",
    roles: "Accountant (manage), Admin (manage), Principal (read)",
  },
  {
    name: "Scholarships",
    what: "Scholarship schemes (a percentage or a fixed amount) and the grants given to students. The discount lands on the student's fee items, so the dues drop immediately.",
    roles: "Accountant (grant/revoke), Principal (read)",
  },
  {
    name: "Batch pay",
    what: "Extra pay for a teacher on top of the base salary, per teaching assignment (a class). It is added to the payslip as \"Teaching pay\".",
    roles: "Accountant (manage), Teacher (read own)",
  },
  {
    name: "Payroll",
    what: "Salary structures, the monthly payroll run, payslips, approval by the principal and marking the payroll as paid.",
    roles: "Accountant (prepare, submit, pay), Principal (approve)",
  },
  {
    name: "Notices",
    what: "Announcements with an audience: everybody, a role, or (for a teacher) the students of one of their classes.",
    roles: "Admin / Principal / Accountant (everybody), Teacher (own classes)",
  },
  {
    name: "Notifications",
    what: "The bell in the header: the notices meant for you plus the alerts your dashboard shows (pending attendance, marks, approvals, payroll).",
    roles: "All roles",
  },
  {
    name: "Staff & employees",
    what: "Employee records with their role profile, contact details and the employee/teacher/principal/accountant profiles.",
    roles: "Admin (manage), others (read their own)",
  },
  {
    name: "Settings & audit",
    what: "College name, attendance edit window, working-days mode, auto-assign fees on admission — plus the audit log of who changed what.",
    roles: "Admin (manage), Principal (read)",
  },
];

export const HELP_ROLE_GUIDES: Record<string, T_HelpRoleGuide> = {
  ADMIN: {
    title: "Admin — set the college up and keep it running",
    summary:
      "You own the master data and the approvals. Everything else in the college depends on what you set up first.",
    can: [
      "Create users and give them a role (admin, principal, accountant, teacher, staff).",
      "Set up the academic structure: courses → batches → terms → subjects.",
      "Assign teaching assignments (who teaches which subject in which class).",
      "Admit students: approve them and the college fee is assigned automatically.",
      "Define fee structures (per course or per batch) and fee heads.",
      "Manage holidays, fiscal years, lookups and the college settings.",
      "Read the audit log of every change.",
    ],
    cannot: [
      "Approve or publish results — that is the principal's job.",
      "Prepare or pay the payroll — that is the accountant's job.",
    ],
    flows: [
      {
        title: "First time setup (do it in this order)",
        steps: [
          "Courses → batches → terms → subjects (Academic structure).",
          "Fee heads (Admin → Lookups → Fee Heads) — e.g. Tuition, Admission, Lab, Library.",
          "Fee structures: one per course, with an optional batch override (Accountant → Fee Structures).",
          "Teaching assignments: assign each teacher to their class and subject.",
          "Create the user accounts and give every person their role.",
        ],
      },
      {
        title: "Admitting a student",
        steps: [
          "The student is added (by you or by a teacher) and starts as PENDING.",
          "Approve the student — the college fee of their batch (or the course default) is assigned automatically.",
          "If no fee structure existed for that batch, the fee is skipped and the warning tells you to assign it by hand.",
        ],
      },
    ],
  },
  PRINCIPAL: {
    title: "Principal — approve and oversee",
    summary:
      "You are the approving authority of the college: results, payroll and the final word on the academic work.",
    can: [
      "Approve or reject the results the teachers submit, then publish them.",
      "Approve or reject the payroll the accountant prepares.",
      "Mark the attendance of the employees.",
      "Approve the students a teacher added.",
      "Read every report, the audit log and every fee and scholarship.",
      "Send notices to everybody or to selected roles and classes.",
    ],
    cannot: [
      "Enter marks or change attendance that a teacher took.",
      "Prepare or pay the payroll — the accountant does that.",
      "Grant a scholarship — the accountant does that.",
    ],
    flows: [
      {
        title: "Publishing the results",
        steps: [
          "Results → Pending results: review what the teachers submitted.",
          "Approve (or reject with a remark) each result.",
          "Results → Publish results once the approved set is complete.",
        ],
      },
      {
        title: "Payroll approval",
        steps: [
          "The accountant prepares the month and submits it.",
          "Pending payroll: check the payslips, then approve or reject.",
          "The accountant marks the approved payroll as paid.",
        ],
      },
    ],
  },
  ACCOUNTANT: {
    title: "Accountant — the money of the college",
    summary:
      "You own the fees, the payments, the payroll and the scholarships. The college fees of a student reach them through the fee structures.",
    can: [
      "Define fee structures per course (with an optional batch override) and their fee items.",
      "Assign a fee structure to one student or to a whole batch (assign on admission).",
      "Set up installments for a fee item when a student pays in parts.",
      "Record payments, split them over fee items and print the receipt.",
      "Create scholarship schemes and grant them to students (or revoke them).",
      "Grant the extra class pay of a teacher (batch pay).",
      "Prepare, submit and pay the monthly payroll.",
      "Post journal entries and manage the accounts.",
    ],
    cannot: [
      "Approve the payroll — the principal does that.",
      "Approve results or admit a student.",
    ],
    flows: [
      {
        title: "What a student owes",
        steps: [
          "Fee Structures: the structure holds the fee heads and the amounts (one-time or per term).",
          "Assign Student / Assign Batch: the items are copied to the student, so the dues appear.",
          "The student fee can then carry a discount (scholarship) and installments.",
          "Payments are recorded on Billing → Record payment, and the receipt can be printed.",
        ],
      },
      {
        title: "Giving a scholarship",
        steps: [
          "Scholarships → New Scholarship: a percentage or a fixed amount.",
          "Grant Scholarship: pick the student, the fee and the fee items to discount.",
          "The dues drop immediately; the grant is kept as an audit trail.",
          "Revoke takes the discount back (not possible once a payment is allocated).",
        ],
      },
    ],
  },
  TEACHER: {
    title: "Teacher — your classes, every day",
    summary:
      "You see your own classes, your students and your results. Everything you do stays inside the classes you teach.",
    can: [
      "See your dashboard: classes, students, attendance %, pending attendance and pending marks.",
      "Take the attendance of your class (and fix it until the session is locked).",
      "Enter the marks of your exam subjects and submit the results.",
      "See your students, their attendance and their results.",
      "Send a notice to the students of one of your classes.",
      "Read your own batch pay (the extra class pay that goes to your payslip).",
    ],
    cannot: [
      "Change the college fees, scholarships or the payroll.",
      "Approve or publish results — the principal does that.",
      "Send a notice to the whole college — only admin, principal and accountant can.",
      "See the classes of other teachers.",
    ],
    flows: [
      {
        title: "A normal teaching day",
        steps: [
          "Dashboard: check the pending attendance and the pending marks entries.",
          "Take Attendance: pick the class and the period, mark the sheet, save.",
          "Marks: open the exam subject, enter the marks of each student, submit.",
          "Results: the submitted results are waiting for the principal's approval.",
        ],
      },
      {
        title: "Noticing a low attendance student",
        steps: [
          "Dashboard → Low attendance lists the students below the threshold.",
          "Open Students to see the attendance of that student.",
          "Attendance sessions: check what happened in the sessions you took.",
        ],
      },
      {
        title: "Notifying your class",
        steps: [
          "Notices → New Notice: pick the class (only your own classes are listed).",
          "The notice reaches the students of that class and shows up in their bell.",
        ],
      },
    ],
  },
  STAFF: {
    title: "Staff — your profile, your payslip, your attendance",
    summary:
      "You look after yourself here: your profile, your payslips, your attendance and the notices of the college.",
    can: [
      "Keep your profile up to date (phone, address, photo, qualification).",
      "See your payslips and your salary history.",
      "Mark and check your own attendance and apply for leave.",
      "Read the notices of the college.",
    ],
    cannot: [
      "See the students, the fees or the payroll of other people.",
    ],
    flows: [
      {
        title: "Checking my payslip",
        steps: [
          "My Payslips: pick a month and open the payslip for the breakdown.",
          "My Attendance: check the days that were counted.",
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
 * "How do I …?" — the questions a user of this role actually asks, each with
 * the steps to do it. The list is different for every role.
 */
export const HELP_FAQ: Record<string, T_HelpFaq[]> = {
  TEACHER: [
    {
      question: "How do I take the test of my students?",
      steps: [
        {
          title: "Open the exam of your subject",
          detail:
            "Go to Exams and pick the exam that holds your subject. If the exam is not there yet, the admin has not created it — ask them for an exam subject of your class.",
        },
        {
          title: "Open the marks sheet",
          detail:
            "In the exam row choose Marks Entry. The sheet lists every student of your class with a box for the marks and an absent checkbox.",
        },
        {
          title: "Enter the marks",
          detail:
            "Type the marks of each student (an absent student keeps the box ticked). Use the arrow keys to move down without touching the mouse.",
        },
        {
          title: "Save the marks",
          detail:
            "Press Save. The sheet tells you how many marks are still missing; you cannot save a half-filled sheet.",
        },
        {
          title: "Submit the result",
          detail:
            "Go to Results, check the submitted result and press Submit. The principal approves it and can then publish it.",
        },
      ],
    },
    {
      question: "How do I take the attendance of my class?",
      steps: [
        {
          title: "Open Take Attendance",
          detail:
            "From the sidebar. The date defaults to today (BS) and the period list is the one of your teaching assignment.",
        },
        {
          title: "Pick the class and the period",
          detail:
            "Choose the class in the selector and the period. Only your own classes are listed.",
        },
        {
          title: "Mark the sheet",
          detail:
            "Mark every student present / absent / late, or use Mark all present and change only the exceptions.",
        },
        {
          title: "Save the sheet",
          detail:
            "Press Save. The session stays editable until the attendance edit window (a setting of the college) has passed — after that it is locked.",
        },
      ],
    },
    {
      question: "How do I see the students of my class?",
      steps: [
        {
          title: "Open Students",
          detail:
            "The list shows the students of the classes you teach. Use the search box to find a student by name or registration number.",
        },
        {
          title: "Open a student",
          detail:
            "The student page shows the personal details, the guardians and the attendance summary.",
        },
        {
          title: "Add a student who is missing",
          detail:
            "Use New Student in the Students page. The student is created as PENDING — an admin approves them and the college fee is assigned at that moment.",
        },
      ],
    },
    {
      question: "How do I notify my class?",
      steps: [
        {
          title: "Open Notices",
          detail: "From the sidebar, then New Notice.",
        },
        {
          title: "Pick the class",
          detail:
            "Only the classes you teach are listed. A teacher notice can never reach the whole college.",
        },
        {
          title: "Write and send",
          detail:
            "Give it a title and a body, then send it. The students of that class see it in their notification bell.",
        },
      ],
    },
    {
      question: "Where do I see my extra class pay (batch pay)?",
      steps: [
        {
          title: "Open Batch Pay",
          detail:
            "It shows the extra pay of each of your classes, with the period it applies to.",
        },
        {
          title: "What you see is what the accountant set",
          detail:
            "A teacher cannot change it. The accountant sets the rate and it lands on your payslip as “Teaching pay”.",
        },
      ],
    },
  ],
  ADMIN: [
    {
      question: "How do I take the test of my students?",
      steps: [
        {
          title: "Create the exam",
          detail:
            "The exam and its exam subjects are the academic setup (with the principal). An exam subject ties one subject of one class to the exam.",
        },
        {
          title: "The teacher enters the marks",
          detail:
            "Once the exam subject exists, the teacher of that class sees it in Marks Entry and fills the sheet.",
        },
        {
          title: "You watch the dashboard",
          detail:
            "Your dashboard shows the pending approvals: results waiting for the principal and students waiting for approval.",
        },
      ],
    },
    {
      question: "How do I admit a student and give them their fees?",
      steps: [
        {
          title: "The student is added",
          detail:
            "By you or by a teacher. The student starts as PENDING — admitting is always a separate step.",
        },
        {
          title: "Approve the student",
          detail:
            "Students → Approve. The college fee of their batch (or the course default) is assigned automatically at that moment.",
        },
        {
          title: "No fee structure? Assign it by hand",
          detail:
            "If the batch has no fee structure you get a warning. Fee Structures → Assign Student / Assign Batch does it manually.",
        },
      ],
    },
    {
      question: "How do I set the college up from scratch?",
      steps: [
        {
          title: "Academic structure",
          detail:
            "Courses → batches → terms → subjects. Everything else (assignments, fees, exams) hangs on this tree.",
        },
        {
          title: "Fee heads and fee structures",
          detail:
            "Lookups → Fee Heads (Tuition, Admission, Lab, Library …), then Fee Structures: one per course with an optional batch override.",
        },
        {
          title: "Teaching assignments",
          detail:
            "Assign every teacher to the classes and subjects they teach. The teacher dashboard fills up from here.",
        },
        {
          title: "Users",
          detail:
            "Create the accounts and give each person their role: admin, principal, accountant, teacher or staff.",
        },
      ],
    },
    {
      question: "How do I change a setting of the college?",
      steps: [
        {
          title: "Open Settings",
          detail:
            "College name, receipt prefix, the attendance edit window, the working days mode and the auto-assign-fees switch.",
        },
        {
          title: "Save the value",
          detail:
            "The setting takes effect right away. AUTO_ASSIGN_FEES_ON_ADMISSION decides whether a fee is assigned when a student is approved.",
        },
      ],
    },
  ],
  ACCOUNTANT: [
    {
      question: "How does a student get their college fees?",
      steps: [
        {
          title: "Define the fee structure",
          detail:
            "Fee Structures → New Fee Structure: a course, an optional batch override, and the fee items (head, amount, one-time or per term).",
        },
        {
          title: "Assign it",
          detail:
            "Assign Student (one student) or Assign Batch (every student of a batch). The items are copied to the student, so the dues appear.",
        },
        {
          title: "It also happens automatically",
          detail:
            "When the admin approves a student, the structure of their batch is assigned automatically — the admin is warned if there is none.",
        },
      ],
    },
    {
      question: "How do I give a scholarship to a student?",
      steps: [
        {
          title: "Create the scheme",
          detail:
            "Scholarships → New Scholarship: a percentage of the fee or a fixed amount.",
        },
        {
          title: "Grant it",
          detail:
            "Grant Scholarship → pick the scholarship, the student, the fee and the fee items to discount. The dues drop immediately.",
        },
        {
          title: "Revoke it if needed",
          detail:
            "Granted tab → Revoke removes the discount from every fee item of that grant. It is refused once a payment is allocated to the fee.",
        },
      ],
    },
    {
      question: "How do I record a fee payment?",
      steps: [
        {
          title: "Open Billing",
          detail: "Then Record payment.",
        },
        {
          title: "Pick the student and the fee",
          detail:
            "The student fee shows every item with its amount, the discount and the net due.",
        },
        {
          title: "Allocate the money",
          detail:
            "Split the paid amount over the fee items and save. A receipt number is generated and can be printed.",
        },
      ],
    },
    {
      question: "How do I prepare the monthly payroll?",
      steps: [
        {
          title: "Open the payroll wizard",
          detail:
            "Pick the BS month. The payslips are built from the salary structures, the attendance and the batch pay of the teachers.",
        },
        {
          title: "Submit it",
          detail: "The principal approves the payroll; after that you mark it as paid.",
        },
        {
          title: "Payslips",
          detail: "Every employee sees their own payslip (basic, allowances, teaching pay, tax, net).",
        },
      ],
    },
  ],
  PRINCIPAL: [
    {
      question: "How do I take the test of my students?",
      steps: [
        {
          title: "The teacher enters the marks",
          detail:
            "The exam subject belongs to the class of a teacher; that teacher fills the marks sheet in Marks Entry.",
        },
        {
          title: "You approve the results",
          detail:
            "Results → Pending results: review what was submitted and approve or reject it.",
        },
        {
          title: "You publish them",
          detail:
            "Results → Publish results once the approved set is complete. Published results are final.",
        },
      ],
    },
    {
      question: "How do I approve the payroll?",
      steps: [
        {
          title: "The accountant prepares it",
          detail:
            "The payroll of a BS month is built and submitted by the accountant.",
        },
        {
          title: "You check the payslips",
          detail: "Pending payroll shows the payslips of that month.",
        },
        {
          title: "You approve or reject",
          detail:
            "Approved, the accountant marks the payroll as paid; rejected, it goes back to them with your remark.",
        },
      ],
    },
    {
      question: "How do I mark the attendance of the employees?",
      steps: [
        {
          title: "Open Employee Attendance",
          detail: "Pick the date (BS) and the employees.",
        },
        {
          title: "Mark and save",
          detail:
            "The attendance feeds the payroll: the present days decide the earned basic salary.",
        },
      ],
    },
    {
      question: "How do I send a notice to the whole college?",
      steps: [
        {
          title: "Open Notices",
          detail: "Then New Notice.",
        },
        {
          title: "Leave the audience on everybody",
          detail:
            "You can also target a role or a class instead. A teacher may only target their own classes.",
        },
        {
          title: "Send it",
          detail:
            "Published notices appear in the notification bell of everyone they were meant for.",
        },
      ],
    },
  ],
  STAFF: [
    {
      question: "How do I check my payslip?",
      steps: [
        {
          title: "Open My Payslips",
          detail: "The list shows the payslip of every month you worked.",
        },
        {
          title: "Open one",
          detail:
            "The payslip breaks down the basic salary, the attendance deduction, the allowances, the tax and the net pay.",
        },
      ],
    },
    {
      question: "How do I check my attendance?",
      steps: [
        {
          title: "Open My Attendance",
          detail: "The month view shows the days that were counted for you.",
        },
        {
          title: "Apply for leave",
          detail:
            "My Leave: a leave request is sent for approval, and a paid leave is not deducted from the salary.",
        },
      ],
    },
    {
      question: "How do I read the notices of the college?",
      steps: [
        {
          title: "Open Notices",
          detail: "Every notice meant for the staff is listed there, newest first.",
        },
        {
          title: "The bell",
          detail:
            "The bell in the header shows the new notices and the alerts that concern you.",
        },
      ],
    },
  ],
};
