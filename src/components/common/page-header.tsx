import { type FC, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbEntry {
  title: string;
  link?: string;
}

export interface PageHeaderProps {
  /** Main page title */
  title: string;

  /** Optional subtitle shown below the title */
  description?: string;

  /** Optional badge / tag shown inline next to the title */
  badge?: ReactNode;

  /** Breadcrumb trail */
  breadCrumbItems?: BreadcrumbEntry[];

  /** Route for the built-in "Create" button */
  createPage?: string;

  /** Label for the create button */
  createPageTitle?: string;

  /** Route for the built-in "Back" button */
  backPage?: string;

  /** Label for the back button */
  backPageTitle?: string;

  /** Slot for fully-custom action nodes */
  actions?: ReactNode;

  /** Hide the bottom border */
  hideSeparator?: boolean;

  /** Extra classes on the root element */
  className?: string;
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

const PageBreadcrumbs: FC<{ items: BreadcrumbEntry[] }> = ({ items }) => (
  <nav aria-label="breadcrumb">
    <ol className="flex items-center flex-wrap gap-0.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <li key={index} className="flex items-center gap-0.5">
            {/* Separator (skip before first item) */}
            {!isFirst && (
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 mx-0.5" />
            )}

            {isLast ? (
              <span
                aria-current="page"
                className="text-sm font-medium text-foreground/70"
              >
                {item.title}
              </span>
            ) : item.link ? (
              <Link
                to={item.link}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                {item.title}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────

const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  breadCrumbItems,
  createPage,
  createPageTitle = "Create",
  backPage,
  backPageTitle = "Back",
  actions,
  hideSeparator = false,
  className,
}) => {
  const hasActions = !!(createPage || backPage || actions);

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* ── Left ── */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground leading-snug">
              {title}
            </h1>
            {badge}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5 max-w-2xl">
              {description}
            </p>
          )}

          {breadCrumbItems && breadCrumbItems.length > 0 && (
            <PageBreadcrumbs items={breadCrumbItems} />
          )}
        </div>

        {/* ── Right: actions ── */}
        {hasActions && (
          <div className="flex items-center gap-2 shrink-0 pb-0.5">
            {backPage && (
              <Link
                to={backPage}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium",
                  "border border-border bg-background text-foreground",
                  "hover:bg-accent transition-colors duration-150",
                  "shadow-xs shadow-black/5",
                )}
              >
                <ArrowLeft className="size-3.5" />
                {backPageTitle}
              </Link>
            )}

            {createPage && (
              <Link
                to={createPage}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors duration-150",
                  "shadow-xs shadow-black/5",
                )}
              >
                <Plus className="size-3.5" />
                {createPageTitle}
              </Link>
            )}

            {actions}
          </div>
        )}
      </div>

      {/* ── Separator ── */}
      {!hideSeparator && <div className="mt-4 h-px bg-border" />}
    </div>
  );
};

export default PageHeader;
