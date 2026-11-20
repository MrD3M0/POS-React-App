import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Banknote, Building2, CalendarDays, Receipt, RotateCcw, Save } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SelectCommand from "@/components/select-command";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useAuth } from "@/auth/context/auth-context";
import {
  listEffectiveSettings,
  upsertSettingByKey,
  type T_EFFECTIVE_SETTING,
  type T_SETTING_DEF,
} from "./service/service";

// ─── Groups (order = display order on the page) ─────────────────────────────

type T_SETTING_GROUP = T_SETTING_DEF["group"];

const GROUPS: readonly { key: T_SETTING_GROUP; label: string; description: string; icon: LucideIcon }[] = [
  {
    key: "college",
    label: "College",
    description: "Name, address and identity used on printed documents.",
    icon: Building2,
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "How attendance sessions behave after they are created.",
    icon: CalendarDays,
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "How payroll counts working days.",
    icon: Banknote,
  },
  {
    key: "fees",
    label: "Fees",
    description: "Fee assignment, receipt numbering and due dates.",
    icon: Receipt,
  },
] as const;

// ─── Enum value labels (fallback: title-cased value) ────────────────────────

const ENUM_LABELS: Record<string, string> = {
  CALENDAR: "All calendar days",
  EXCLUDE_HOLIDAYS: "Exclude holidays",
  EXCLUDE_HOLIDAYS_AND_WEEKLY_OFF: "Exclude holidays + Saturdays",
  true: "On",
  false: "Off",
};

const enumLabel = (value: string): string =>
  ENUM_LABELS[value] ?? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

/** true/false enums render as an on/off switch. */
const isBooleanEnum = (def: T_SETTING_DEF): boolean =>
  def.type === "enum" &&
  def.values?.length === 2 &&
  def.values.includes("true") &&
  def.values.includes("false");

// ─── Page ────────────────────────────────────────────────────────────────────

export type T_SettingsScope = "admin" | "principal";

export function SettingsScreen({ scope }: { scope: T_SettingsScope }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  // Admin owns every section; the principal owns the college identity printed
  // on ID cards (logo, contacts, affiliation) and sees the rest read-only.
  const isAdmin = user?.role === "ADMIN";
  const isPrincipal = user?.role === "PRINCIPAL";
  const canEditGroup = (group: T_SETTING_GROUP): boolean =>
    isAdmin || (isPrincipal && group === "college");
  const isPrincipalScope = scope === "principal";

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL, "effective"],
    queryFn: listEffectiveSettings,
  });

  const settings: T_EFFECTIVE_SETTING[] = query.data?.data ?? [];

  // Draft values per key — nothing is sent until the group's Save is pressed.
  // Unsaved keys simply fall back to the server value (`draft[key] ?? value`),
  // so no effect-based resync is needed after refetches.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingGroup, setSavingGroup] = useState<T_SETTING_GROUP | null>(null);

  const setValue = (key: string, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const dirtyKeysOf = (group: T_SETTING_GROUP): T_EFFECTIVE_SETTING[] =>
    settings.filter((s) => s.definition.group === group && (draft[s.key] ?? s.value) !== s.value);

  const saveGroup = async (group: T_SETTING_GROUP) => {
    const dirty = dirtyKeysOf(group);
    if (dirty.length === 0) return;
    setSavingGroup(group);
    try {
      for (const setting of dirty) {
        await upsertSettingByKey(setting.key, draft[setting.key] ?? setting.value);
      }
      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL] });
      // ID cards read the college identity from the institution endpoint.
      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.INSTITUTION] });
      toast.success("Settings saved.");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? "Failed to save settings."
        : "Failed to save settings.";
      toast.error(message);
    } finally {
      setSavingGroup(null);
    }
  };

  const resetGroup = (group: T_SETTING_GROUP) => {
    setDraft((prev) => {
      const next = { ...prev };
      settings
        .filter((s) => s.definition.group === group)
        .forEach((s) => {
          next[s.key] = s.value;
        });
      return next;
    });
  };

  const grouped = GROUPS.map((group) => ({
    ...group,
    items: settings.filter((s) => s.definition.group === group.key),
  }));

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title={isPrincipalScope ? "College Settings" : "Settings"}
        description={
          isPrincipalScope
            ? "Edit the college identity printed on student ID cards: logo, affiliation, address, email, contact and signature. Other sections are read-only."
            : "College identity, attendance, payroll and fee behavior. Changes are saved per section."
        }
        breadCrumbItems={[
          isPrincipalScope
            ? { title: "Principal", link: "/principal" }
            : { title: "Admin", link: "/admin" },
          {
            title: "Settings",
            link: isPrincipalScope ? "/principal/settings" : "/admin/settings",
          },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {grouped.map((group) => {
          const dirty = dirtyKeysOf(group.key);
          const canEdit = canEditGroup(group.key);
          const Icon = group.icon;
          return (
            <section key={group.key} className="rounded-lg border">
              <div className="flex items-start gap-3 border-b px-4 py-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{group.label}</h2>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
              </div>

              <div className="divide-y">
                {group.items.map((setting) => (
                  <SettingRow
                    key={setting.key}
                    setting={setting}
                    value={draft[setting.key] ?? setting.value}
                    onChange={(value) => setValue(setting.key, value)}
                    disabled={!canEdit || savingGroup !== null}
                  />
                ))}
                {group.items.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No settings in this section.</p>
                ) : null}
              </div>

              {canEdit && dirty.length > 0 ? (
                <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-4 py-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => resetGroup(group.key)}
                    disabled={savingGroup !== null}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    loading={savingGroup === group.key}
                    onClick={() => void saveGroup(group.key)}
                  >
                    <Save className="size-3.5" />
                    Save {group.label}
                  </Button>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return <SettingsScreen scope="admin" />;
}

// ─── One setting row: control chosen by the registry definition ─────────────

function SettingRow({
  setting,
  value,
  onChange,
  disabled,
}: {
  setting: T_EFFECTIVE_SETTING;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const def = setting.definition;

  return (
    <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 sm:max-w-md">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{def.label}</p>
          {setting.isDefault ? <Badge variant="outline">Default</Badge> : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
      </div>

      <div className="shrink-0 sm:w-56">
        {isBooleanEnum(def) ? (
          <label className="flex h-8.5 cursor-pointer items-center justify-end gap-2 sm:justify-end">
            <span className="text-xs text-muted-foreground">{value === "true" ? "On" : "Off"}</span>
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
              disabled={disabled}
              aria-label={def.label}
            />
          </label>
        ) : def.type === "enum" ? (
          <SelectCommand
            value={value}
            onChange={(next) => onChange(typeof next === "string" ? next : "")}
            options={(def.values ?? []).map((v) => ({ label: enumLabel(v), value: v }))}
            placeholder="Select value"
            hideSearch
            disabled={disabled}
          />
        ) : def.type === "number" ? (
          <Input
            type="number"
            inputMode="numeric"
            min={def.min}
            max={def.max}
            step="1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label={def.label}
          />
        ) : (
          <Input
            type="text"
            value={value}
            maxLength={def.maxLength}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label={def.label}
          />
        )}
        {def.type === "number" && (def.min !== undefined || def.max !== undefined) ? (
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {def.min !== undefined && def.max !== undefined
              ? `${def.min}–${def.max}`
              : def.min !== undefined
                ? `Min ${def.min}`
                : `Max ${def.max}`}
          </p>
        ) : null}

        {/* Logo / signature URL preview so the principal can see the result. */}
        {setting.key === "COLLEGE_LOGO_URL" ||
        setting.key === "COLLEGE_SIGNATURE_URL" ? (
          <div className="mt-2 flex h-14 items-center justify-center rounded-md border bg-white p-1.5">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={def.label}
                className="max-h-12 max-w-full object-contain"
              />
            ) : (
              <span className="text-[11px] text-neutral-500">
                Paste an image URL
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
