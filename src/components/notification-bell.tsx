import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, CircleAlert, Megaphone } from "lucide-react";
import { QUERY_KEYS } from "@/lib/query-keys";
import { UrlConstants } from "@/constants/endpoints";
import axiosInstance from "@/lib/axios-request";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type T_NotificationItem = {
  id: string;
  type: "NOTICE" | "ALERT";
  title: string;
  body?: string | null;
  link: string;
  severity: "info" | "warning" | "success";
  createdAt: string;
};

type T_NotificationFeed = {
  items: T_NotificationItem[];
  counts: { total: number; notices: number; alerts: number };
};

const LAST_SEEN_KEY = "collify:notifications:last-seen-at";

function readLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LAST_SEEN_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeLastSeen(at: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, String(at));
}

/**
 * Header bell: the notices that are meant for me plus the alerts my dashboard
 * shows (pending attendance, marks, approvals, payroll).
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => readLastSeen());

  const query = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION],
    queryFn: async () => {
      const res = await axiosInstance.get(`${UrlConstants.NOTIFICATION_URL}`, {
        params: { limit: 15 },
      });
      return (res.data?.data ?? res.data) as T_NotificationFeed;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const unreadCount = useMemo(
    () =>
      items.filter(
        (item) => new Date(item.createdAt).getTime() > (lastSeen || 0),
      ).length,
    [items, lastSeen],
  );

  function markAllRead() {
    const now = Date.now();
    writeLastSeen(now);
    setLastSeen(now);
  }

  function openItem(item: T_NotificationItem) {
    setOpen(false);
    navigate(item.link);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 cursor-pointer rounded-full border bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 ? (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {query.data?.counts.notices ?? 0} notice(s) ·{" "}
              {query.data?.counts.alerts ?? 0} alert(s)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </div>

        <ScrollArea className="max-h-96">
          {query.isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading notifications…
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing new for you.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                        item.type === "NOTICE"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600",
                      )}
                    >
                      {item.type === "NOTICE" ? (
                        <Megaphone className="size-4" />
                      ) : (
                        <CircleAlert className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
