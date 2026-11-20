import type { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/form";
import { EMPLOYEE_ROLES, type T_EMPLOYEE_CREATE } from "./employee.schema";

type EmploymentStepProps = {
  form: UseFormReturn<T_EMPLOYEE_CREATE>;
};

export default function EmploymentStep({ form }: EmploymentStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="employeeCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee Code *</FormLabel>
            <FormControl>
              <Input placeholder="e.g. EMP-001" {...field} />
            </FormControl>
            <FormDescription>Unique employee identifier/code.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="designation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Designation *</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Senior Lecturer" {...field} />
            </FormControl>
            <FormDescription>Job title/designation.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role *</FormLabel>
            <FormControl>
              <SelectCommand
                value={field.value}
                onChange={field.onChange}
                options={EMPLOYEE_ROLES.map((role) => ({
                  label: role.charAt(0) + role.slice(1).toLowerCase(),
                  value: role,
                }))}
                placeholder="Select role"
                hideSearch
              />
            </FormControl>
            <FormDescription>System role used for access and permissions.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="joinDateBs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Join Date (BS) *</FormLabel>
            <FormControl>
              <BsDatePicker
                value={field.value ?? ""}
                valueFormat="bs"
                lang="en"
                placeholder="Select join date (BS)"
                onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormDescription>Employment start date in Bikram Sambat (YYYY-MM-DD).</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Login and contact email address.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password *</FormLabel>
            <FormControl>
              <PasswordInput {...field} />
            </FormControl>
            <FormDescription>Minimum 8 characters.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
