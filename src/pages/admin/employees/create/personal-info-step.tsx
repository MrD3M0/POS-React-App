import type { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/input";
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
import type { T_EMPLOYEE_CREATE } from "./employee.schema";

type PersonalInfoStepProps = {
  form: UseFormReturn<T_EMPLOYEE_CREATE>;
};

export default function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Given/first name.</FormDescription>
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
            <FormLabel>Last Name *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Family/last name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender *</FormLabel>
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
            <FormDescription>Select gender (fixed enum).</FormDescription>
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
                valueFormat="bs"
                lang="en"
                placeholder="Select DOB (BS)"
                onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormDescription>Optional date of birth in Bikram Sambat.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Phone</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional contact number.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="permanentAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Permanent Address</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional permanent address.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="temporaryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel isOptional>Temporary Address</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional temporary/current address.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
