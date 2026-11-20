import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import type { AddStudentStepProps } from "../schema";

/** Step 4 — Guardian Info. */
export default function StepGuardian({ form }: AddStudentStepProps) {
  // The guardian name label follows the selected relation
  // (“FATHER Name”, “MOTHER Name”, …), exactly like before.
  const guardianRelation = form.watch("guardianRelation");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="guardianRelation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guardian Relation</FormLabel>
            <FormControl>
              <SelectCommand
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "Father", value: "FATHER" },
                  { label: "Mother", value: "MOTHER" },
                  { label: "Guardian", value: "GUARDIAN" },
                  { label: "Other", value: "OTHER" },
                ]}
                placeholder="Select relation"
                hideSearch
              />
            </FormControl>
            <FormDescription>Primary guardian relationship.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guardianName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{guardianRelation} Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Guardian&apos;s full name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guardianPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Guardian Phone</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional guardian contact.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guardianEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Guardian Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional guardian email.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guardianOccupation"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Occupation</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional guardian occupation.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guardianAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Guardian Address</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional guardian address.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
