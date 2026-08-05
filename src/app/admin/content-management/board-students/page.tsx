
"use client"
import { supabase } from "@/lib/supabase";
import { BoardStudent, boardStudentSchema } from './data/schema';
import { z } from 'zod';
import { BoardStudentCard } from './components/board-student-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateBoardStudentDialog } from './components/create-board-student-dialog';

export default function BoardStudentsPage() {
  const [boardStudents, setBoardStudents] = useState<BoardStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function loadBoardStudents() {
      const { data, error } = await supabase.from('board_students').select('*');
      if (error) {
        setBoardStudents([]);
      } else if (data) {
        const formatted = data.map(item => ({ ...item, id: String(item.id) }));
        const parsed = z.array(boardStudentSchema).safeParse(formatted);
        if (parsed.success) {
          setBoardStudents(parsed.data);
        } else {
          const valid = formatted.map(i => boardStudentSchema.safeParse(i)).map(r => r.success ? r.data : null).filter(Boolean) as any;
          setBoardStudents(valid);
        }
      }
      setLoading(false);
    }
    loadBoardStudents();
    const channel = supabase.channel('board_students-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_students' }, () => loadBoardStudents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if(loading) {
    return (
       <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
       </div>
    )
  }

  return (
    <>
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Board Students Management</h2>
          <p className="text-muted-foreground">
            Manage the list of your school&apos;s students with board exam results.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Board Student
        </Button>
      </div>
      
      {boardStudents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boardStudents.map((item) => (
            <BoardStudentCard key={item.id} student={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-1 text-center py-20">
                <h3 className="text-2xl font-bold tracking-tight">
                No board students found
                </h3>
                <p className="text-sm text-muted-foreground">
                Click &quot;Add Board Student&quot; to feature a student&apos;s board results.
                </p>
            </div>
        </div>
      )}
    </div>
    <CreateBoardStudentDialog isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
