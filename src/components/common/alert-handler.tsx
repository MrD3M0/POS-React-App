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
  message: string;
  dismissible?: boolean;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ReactNode; styles: string }> =
  {
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      styles: "bg-green-50 text-green-800 border-green-200",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      styles: "bg-red-50 text-red-800 border-red-200",
    },
    warning: {
      icon: <TriangleAlert className="h-4 w-4" />,
      styles: "bg-yellow-50 text-yellow-800 border-yellow-200",
    },
    info: {
      icon: <Info className="h-4 w-4" />,
      styles: "bg-blue-50 text-blue-800 border-blue-200",
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
        <p>{message}</p>
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
