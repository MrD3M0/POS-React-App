import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Keyboard,
  ListChecks,
  MessageCircleQuestion,
  PlayCircle,
  Rocket,
  Wrench,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/auth/context/auth-context";
import {
  HELP_FALLBACK_ROLE,
  HELP_FAQ,
  HELP_MODULES,
  HELP_ROLE_GUIDES,
  HELP_SETUP,
  HELP_SHORTCUTS,
  type T_HelpRoleGuide,
} from "./content";

const TABS = [
  { key: "role", label: "My role", icon: CircleHelp },
  { key: "faq", label: "How do I…?", icon: MessageCircleQuestion },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { key: "modules", label: "Modules", icon: ListChecks },
  { key: "setup", label: "How to run it", icon: Wrench },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((key, index) => (
        <span key={key} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="text-muted-foreground">+</span> : null}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

/**
 * Help: the role guide (what this role may do, step by step), the keyboard
 * shortcuts, what every module does, and how to run the application locally.
 */
export default function HelpPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("role");

  const guide: T_HelpRoleGuide =
    HELP_ROLE_GUIDES[user?.role ?? ""] ?? HELP_FALLBACK_ROLE;
  const faq = HELP_FAQ[user?.role ?? ""] ?? [];

  return (
    <div className="p-5">
      <PageHeader
        title="Help"
        description="What this application does, how to run it, and what your role can do."
        breadCrumbItems={[{ title: "Help", link: "/help" }]}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <Button
              key={item.key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(item.key)}
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab === "role" ? (
        <div className="space-y-5">
          <section className="rounded-lg border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">{guide.title}</h2>
              {user?.role ? (
                <Badge variant="secondary">{user.role}</Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  What I can do
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {guide.can.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {guide.can.length === 0 ? (
                    <li className="text-muted-foreground">
                      Nothing to show for this role yet.
                    </li>
                  ) : null}
                </ul>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  What is handled by someone else
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {guide.cannot.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {guide.cannot.length === 0 ? (
                    <li className="text-muted-foreground">
                      Nothing to show for this role yet.
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </section>

          {guide.flows.map((flow) => (
            <section key={flow.title} className="rounded-lg border p-5">
              <div className="flex items-center gap-2">
                <PlayCircle className="size-5 text-primary" />
                <h2 className="text-base font-semibold">{flow.title}</h2>
              </div>
              <ol className="mt-3 space-y-2">
                {flow.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The questions of your role — open one to see the steps.
          </p>
          {faq.map((entry) => (
            <Collapsible
              key={entry.question}
              className="group rounded-lg border bg-card transition-colors duration-150"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span>{entry.question}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t px-4 py-4">
                <ol className="space-y-3">
                  {entry.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Step {index + 1}: {step.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          ))}
          {faq.length === 0 ? (
            <p className="rounded-lg border p-4 text-sm text-muted-foreground">
              No question is written for this role yet.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "shortcuts" ? (
        <div className="space-y-4">
          <section className="rounded-lg border p-5">
            <div className="flex items-center gap-2">
              <Keyboard className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              On macOS use <span className="font-medium">⌘</span> instead of{" "}
              <span className="font-medium">Ctrl</span>.
            </p>
            <div className="mt-4 divide-y">
              {HELP_SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.keys.join("+")}
                  className="flex flex-wrap items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{shortcut.what}</p>
                    {shortcut.where ? (
                      <p className="text-xs text-muted-foreground">
                        {shortcut.where}
                      </p>
                    ) : null}
                  </div>
                  <Keys keys={shortcut.keys} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">
              The command palette (Ctrl + K) lists every page of your role, the
              quick actions of your role and the theme switch.
            </p>
          </section>
        </div>
      ) : null}

      {tab === "modules" ? (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b p-5">
            <ListChecks className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">What each module does</h2>
          </div>
          <div className="divide-y">
            {HELP_MODULES.map((module) => (
              <div key={module.name} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{module.name}</h3>
                  <Badge variant="outline">{module.roles}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.what}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "setup" ? (
        <div className="space-y-4">
          <section className="rounded-lg border p-5">
            <div className="flex items-center gap-2">
              <Rocket className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Run the application locally</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The repository holds the API (CollegeMS-Backend-Node) and the web
              app (CollegeMS-React-App).
            </p>
          </section>

          {HELP_SETUP.map((section) => (
            <section key={section.title} className="rounded-lg border p-5">
              <h3 className="text-base font-semibold">{section.title}</h3>
              <ol className="mt-3 space-y-2">
                {section.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-mono text-[13px]">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <section className="rounded-lg border p-5">
            <p className="text-sm">
              The seeded accounts and their passwords are listed in{" "}
              <span className="font-mono">SEED_CREDENTIALS.md</span> at the
              root of the repository.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              New here? Start with{" "}
              <Link to="/dashboard" className="text-primary underline">
                your dashboard
              </Link>
              .
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
