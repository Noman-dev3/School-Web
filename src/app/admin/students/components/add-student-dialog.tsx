"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { studentSchema } from "../data/schema"
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, GraduationCap, Loader2, UserPlus, ShieldCheck } from "lucide-react"

const addStudentSchema = studentSchema.omit({ id: true })
type AddStudentFormValues = z.infer<typeof addStudentSchema>

interface AddStudentDialogProps {
  onSuccess?: () => void;
}

export function AddStudentDialog({ onSuccess }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      Name: "",
      Class: "1st",
      Section: "A",
      Contact: "",
      Gender: "Male",
      Address: "",
      Date_Added: new Date().toISOString().split('T')[0],
      Fee_Slip_Path: "",
      profilePicture: "",
    },
  })

  async function onSubmit(data: AddStudentFormValues) {
    setLoading(true)
    try {
      const { error } = await supabase.from('students').insert([{
        Name: data.Name,
        Class: data.Class,
        Section: data.Section || 'A',
        Contact: data.Contact,
        Gender: data.Gender,
        Address: data.Address,
        Date_Added: data.Date_Added || new Date().toISOString().split('T')[0],
        Fee_Slip_Path: data.Fee_Slip_Path || "",
        profilePicture: data.profilePicture || ""
      }])

      if (error) throw error

      toast({
        title: "Student Added Successfully!",
        description: `${data.Name} has been enrolled in Class ${data.Class} (${data.Section || 'A'}).`,
      })
      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Error adding student:", error)
      toast({
        title: "Failed to Add Student",
        description: error.message || "Please check database connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs gap-1.5 font-bold shadow-md">
          <UserPlus className="h-4 w-4" />
          <span>Add Student</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl border-border/80 p-6">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-border/50">
          <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2 text-foreground">
            <GraduationCap className="w-5 h-5 text-emerald-600" /> Enroll New Student
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an official student record in the school directory and fee database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Full Student Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Muhammad Ali Shah" {...field} className="h-9 rounded-xl text-xs" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Contact"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Parent / Guardian Contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 0300 1234567" {...field} className="h-9 rounded-xl text-xs" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <FormField
                control={form.control}
                name="Class"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Class Grade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl text-xs">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {["Playgroup", "Nursery", "Prep", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((c) => (
                          <SelectItem key={c} value={c}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Section"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Section</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "A"}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl text-xs">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {["A", "B", "C", "D", "Girls Wing", "Boys Wing"].map((s) => (
                          <SelectItem key={s} value={s}>Section {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <FormField
                control={form.control}
                name="Gender"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "Male"}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl text-xs">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Male">Male (Boy)</SelectItem>
                        <SelectItem value="Female">Female (Girl)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Date_Added"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-bold">Admission Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-9 rounded-xl text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Address"
              render={({ field }) => (
                <FormItem className="space-y-1 text-xs">
                  <FormLabel className="font-bold">Home Address / Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Swari, Buner, KP" {...field} className="h-9 rounded-xl text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-3 border-t border-border/50 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="rounded-xl text-xs h-9 font-semibold">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-bold px-5 gap-1.5 shadow-md">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? "Enrolling..." : "Enroll Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
