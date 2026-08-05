
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import React from "react";

const formSchema = z.object({
  applicantName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  dob: z.date({
    message: "A date of birth is required.",
  }),
  gender: z.enum(["male", "female", "other"], {
    message: "You need to select a gender.",
  }),
  parentName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  parentEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  parentPhone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  appliedClass: z.string({
    message: "Please select a class.",
  }),
  previousSchool: z.string().optional(),
  comments: z.string().optional(),
});

const DateOfBirthPicker: React.FC<{
  value: Date | undefined;
  onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
  const [day, setDay] = React.useState<string | undefined>(
    value ? String(value.getDate()) : undefined
  );
  const [month, setMonth] = React.useState<string | undefined>(
    value ? String(value.getMonth()) : undefined
  );
  const [year, setYear] = React.useState<string | undefined>(
    value ? String(value.getFullYear()) : undefined
  );

  React.useEffect(() => {
    if (day && month && year) {
      const newDate = new Date(Number(year), Number(month), Number(day));
      onChange(newDate);
    }
  }, [day, month, year, onChange]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 1 - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="flex gap-2">
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="w-1/3 bg-background">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-1/3 bg-background">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-1/3 bg-background">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};


export function AdmissionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      previousSchool: "",
      comments: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.from('admissions').insert([{
        ...values,
        dob: format(values.dob, "yyyy-MM-dd"),
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }]);
      if (error) throw error;

      // Redirect to thank you page
      router.push('/admissions/thank-you');

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="max-w-4xl mx-auto bg-secondary/30 border-border/20">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold font-headline">
          Admission Application Form
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Please fill out the form carefully. All fields marked with * are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold font-headline border-b pb-2">
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., John Doe"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <DateOfBirthPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gender *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-6"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold font-headline border-b pb-2">
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jane Doe"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., jane.doe@email.com"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., +1 555 123 4567"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold font-headline border-b pb-2">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="appliedClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applying for Class *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="playgroup">Playgroup</SelectItem>
                          <SelectItem value="nursery">Nursery</SelectItem>
                          <SelectItem value="prep">Prep</SelectItem>
                          <SelectItem value="class1">Class 1</SelectItem>
                          <SelectItem value="class2">Class 2</SelectItem>
                          <SelectItem value="class3">Class 3</SelectItem>
                          <SelectItem value="class4">Class 4</SelectItem>
                          <SelectItem value="class5">Class 5</SelectItem>
                          <SelectItem value="class6">Class 6</SelectItem>
                          <SelectItem value="class7">Class 7</SelectItem>
                          <SelectItem value="class8">Class 8</SelectItem>
                          <SelectItem value="class9">Class 9</SelectItem>
                          <SelectItem value="class10">Class 10</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousSchool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous School (if any)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ABC School"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold font-headline border-b pb-2">
                Additional Information
              </h3>
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please share any other information you think is relevant."
                        className="bg-background"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-center pt-6">
              <Button type="submit" size="lg" className="w-full max-w-xs">
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
