import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import type { AddStudentStepProps } from "../schema";

/** Step 1 — Personal Info. */
export default function StepPersonal({ form }: AddStudentStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Student&apos;s given name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="middleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Middle Name</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional middle name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Student&apos;s family name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <FormControl>
              <SelectCommand
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                  { label: "Others", value: "OTHERS" },
                ]}
                placeholder="Select gender"
                hideSearch
              />
            </FormControl>
            <FormDescription>Fixed gender options.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dobBs"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Date of Birth (BS)</FormLabel>
            <FormControl>
              <BsDatePicker
                value={field.value ?? ""}
                onChange={(value) =>
                  field.onChange(typeof value === "string" ? value : "")
                }
                valueFormat="bs"
                lang="en"
                placeholder="Select DOB"
              />
            </FormControl>
            <FormDescription>Optional date of birth in BS.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
