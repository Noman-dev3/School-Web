const fs = require('fs');

const files = [
    'src/app/admin/board-students/components/create-board-student-dialog.tsx',
    'src/app/admin/board-students/components/edit-board-student-dialog.tsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /const (create|edit)BoardStudentSchema = boardStudentSchema.omit\({ id: true }\);/,
        `const $1BoardStudentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  class: z.string().min(1, "Class cannot be empty."),
  boardRollNo: z.string().min(1, "Board Roll No. cannot be empty."),
  obtainedMarks: z.coerce.number().min(0, "Obtained marks must be a positive number."),
  totalMarks: z.coerce.number().min(1, "Total marks must be greater than 0."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")).nullable(),
});`
    );
    
    // add z import if missing
    if (!content.includes('import { z }')) {
        content = 'import { z } from "zod";\n' + content;
    }
    
    fs.writeFileSync(file, content);
}
console.log('Fixed');
