// components/ui/app-alert.tsx

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AppAlertProps {
  variant: AlertVariant;
  title?: string;
  message?: string;
  dismissible?: boolean;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ReactNode; styles: string }> =
  {
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      styles:
        "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/40",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      styles:
        "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/40",
    },
    warning: {
      icon: <TriangleAlert className="h-4 w-4" />,
      styles:
        "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300 dark:border-amber-500/40",
    },
    info: {
      icon: <Info className="h-4 w-4" />,
      styles:
        "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-300 dark:border-sky-500/40",
    },
  };

export default function AlertHandler({
  variant,
  title,
  message,
  dismissible = false,
  className,
}: AppAlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const { icon, styles } = config[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm",
        styles,
        className,
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {message ? <p>{message}</p> : null}
      </div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="mt-0.5 shrink-0 opacity-60 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
