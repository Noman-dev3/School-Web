import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Result } from "@/app/admin/content-management/results/data/schema";
import { format } from "date-fns";

export interface SchoolInfo {
  schoolName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface StudentInfo {
  fatherName?: string;
  section?: string;
  gender?: string;
  contact?: string;
  address?: string;
  attendance?: string;
  remarks?: string;
}

const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
  tagline: "Excellence in Academic Rigor & Timeless Values",
  address: "Sector H-8/4, Educational Zone, Islamabad, Pakistan",
  phone: "+92 51 111 222 333",
  email: "info@piiss.edu.pk",
};

// Calculate Subject Grade and Performance Label based on marks
function getSubjectGradeAndStatus(marks: number, maxMarks: number = 100) {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return { grade: "A+", status: "Outstanding", color: "15803D" };
  if (percentage >= 80) return { grade: "A", status: "Excellent", color: "16A34A" };
  if (percentage >= 70) return { grade: "B", status: "Very Good", color: "2563EB" };
  if (percentage >= 60) return { grade: "C", status: "Good", color: "D97706" };
  if (percentage >= 50) return { grade: "D", status: "Satisfactory", color: "CA8A04" };
  return { grade: "F", status: "Needs Work", color: "DC2626" };
}

// Calculate GPA based on overall percentage
function calculateGPA(percentage: number): string {
  if (percentage >= 90) return "4.00 / 4.00";
  if (percentage >= 80) return "3.70 / 4.00";
  if (percentage >= 70) return "3.20 / 4.00";
  if (percentage >= 60) return "2.70 / 4.00";
  if (percentage >= 50) return "2.00 / 4.00";
  return "0.00 / 4.00";
}

// Default remark based on overall percentage
function getDefaultRemark(percentage: number): string {
  if (percentage >= 85) {
    return "Outstanding academic performance. Demonstrates exceptional critical thinking, analytical mastery, and commendable classroom leadership.";
  }
  if (percentage >= 70) {
    return "Very good progress overall. Shows strong conceptual understanding and consistent diligence. Encouraged to aim for distinction.";
  }
  if (percentage >= 50) {
    return "Satisfactory performance with positive potential. Regular practice and focused review in core subjects will yield better results.";
  }
  return "Requires immediate academic attention and remedial guidance. Parent-teacher consultation is recommended.";
}

export async function generateResultDocumentBlob(
  result: Result,
  schoolInfo?: Partial<SchoolInfo>,
  studentInfo?: StudentInfo
): Promise<Blob> {
  const school: SchoolInfo = { ...DEFAULT_SCHOOL_INFO, ...schoolInfo };
  const issueDateStr = result.date_created
    ? format(new Date(result.date_created), "MMMM dd, yyyy")
    : format(new Date(), "MMMM dd, yyyy");

  const overallGpa = calculateGPA(result.percentage);
  const remarkText = studentInfo?.remarks || getDefaultRemark(result.percentage);
  const attendanceText = studentInfo?.attendance || "96% Present (Regular Attendance)";

  // Primary Theme Colors (Navy #1E3A8A & Dark Charcoal #0F172A)
  const COLOR_NAVY = "1E3A8A";
  const COLOR_SLATE = "0F172A";
  const COLOR_LIGHT_BG = "F8FAFC";
  const COLOR_HEADER_BG = "F1F5F9";
  const COLOR_BORDER = "CBD5E1";
  const COLOR_MUTED = "475569";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          // 1. SCHOOL BRANDING HEADER
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: school.schoolName.toUpperCase(),
                bold: true,
                size: 32, // 16pt
                color: COLOR_NAVY,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: school.tagline,
                italics: true,
                size: 20, // 10pt
                color: COLOR_MUTED,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `${school.address}  |  Ph: ${school.phone}  |  Email: ${school.email}`,
                size: 17, // 8.5pt
                color: COLOR_MUTED,
                font: "Arial",
              }),
            ],
          }),

          // Decorative Solid Navy Separator
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [new Paragraph({ spacing: { after: 20 }, children: [] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 160 }, children: [] }),

          // 2. REPORT CARD TITLE BANNER
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "OFFICIAL STUDENT ACADEMIC PROGRESS REPORT",
                bold: true,
                size: 24, // 12pt
                color: COLOR_SLATE,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `ACADEMIC SESSION: ${result.session || "2025-2026"}`,
                bold: true,
                size: 19,
                color: COLOR_NAVY,
                font: "Arial",
              }),
            ],
          }),

          // 3. STUDENT INFORMATION GRID
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createMetadataCell("STUDENT NAME", result.student_name, true),
                  createMetadataCell("ROLL / REG NO.", result.roll_number, true),
                ],
              }),
              new TableRow({
                children: [
                  createMetadataCell("CLASS & SECTION", `${result.class}${studentInfo?.section ? ` (${studentInfo.section})` : ""}`),
                  createMetadataCell("STUDENT ID", result.student_id || result.roll_number),
                ],
              }),
              new TableRow({
                children: [
                  createMetadataCell("GENDER / CONTACT", `${studentInfo?.gender || "N/A"}${studentInfo?.contact ? ` | ${studentInfo.contact}` : ""}`),
                  createMetadataCell("DATE OF ISSUE", issueDateStr),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 240 }, children: [] }),

          // 4. SUBJECT-WISE MARKS BREAKDOWN TABLE
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "SUBJECT-WISE ACADEMIC PERFORMANCE",
                bold: true,
                size: 20,
                color: COLOR_NAVY,
                font: "Arial",
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  createTableHeaderCell("SR #", 8),
                  createTableHeaderCell("SUBJECT NAME", 36),
                  createTableHeaderCell("MARKS OBTAINED", 18),
                  createTableHeaderCell("MAX MARKS", 14),
                  createTableHeaderCell("GRADE", 12),
                  createTableHeaderCell("STATUS", 12),
                ],
              }),
              // Subject Data Rows
              ...Object.entries(result.subjects || {}).map(([subject, marks], idx) => {
                const subjectMaxMarks = 100;
                const { grade, status } = getSubjectGradeAndStatus(marks, subjectMaxMarks);
                const isAlt = idx % 2 === 1;
                return new TableRow({
                  children: [
                    createTableCell((idx + 1).toString(), AlignmentType.CENTER, isAlt, 8),
                    createTableCell(subject, AlignmentType.LEFT, isAlt, 36, true),
                    createTableCell(marks.toString(), AlignmentType.CENTER, isAlt, 18, true),
                    createTableCell(subjectMaxMarks.toString(), AlignmentType.CENTER, isAlt, 14),
                    createTableCell(grade, AlignmentType.CENTER, isAlt, 12, true),
                    createTableCell(status, AlignmentType.CENTER, isAlt, 12),
                  ],
                });
              }),
              // Summary / Totals Row
              new TableRow({
                children: [
                  createTableSummaryCell("TOTAL / OVERALL", 44, AlignmentType.LEFT),
                  createTableSummaryCell(`${result.total_marks}`, 18, AlignmentType.CENTER, true),
                  createTableSummaryCell(`${result.max_marks}`, 14, AlignmentType.CENTER),
                  createTableSummaryCell(result.grade, 12, AlignmentType.CENTER, true),
                  createTableSummaryCell(`${result.percentage}%`, 12, AlignmentType.CENTER, true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 240 }, children: [] }),

          // 5. PERFORMANCE METRICS SUMMARY CARDS
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "OVERALL PERFORMANCE SUMMARY",
                bold: true,
                size: 20,
                color: COLOR_NAVY,
                font: "Arial",
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createSummaryCardCell("PERCENTAGE", `${result.percentage}%`),
                  createSummaryCardCell("FINAL GRADE", result.grade),
                  createSummaryCardCell("GPA", overallGpa),
                  createSummaryCardCell(
                    "STATUS",
                    result.percentage >= 50 ? "PASSED" : "NEEDS IMPROVEMENT"
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 240 }, children: [] }),

          // 6. TEACHER REMARKS & ATTENDANCE BOX
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_LIGHT_BG, type: ShadingType.CLEAR },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
                      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_NAVY }, // Accent side border
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
                    },
                    margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: "CLASS TEACHER ASSESSMENT & REMARKS:",
                            bold: true,
                            size: 18,
                            color: COLOR_NAVY,
                            font: "Arial",
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: `"${remarkText}"`,
                            italics: true,
                            size: 19,
                            color: COLOR_SLATE,
                            font: "Arial",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "ATTENDANCE RECORD: ",
                            bold: true,
                            size: 17,
                            color: COLOR_MUTED,
                            font: "Arial",
                          }),
                          new TextRun({
                            text: attendanceText,
                            size: 17,
                            color: COLOR_SLATE,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 480 }, children: [] }),

          // 7. OFFICIAL SIGNATURES & STAMP SECTION
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createSignatureCell("Class Teacher Signature"),
                  createSignatureCell("Exam Controller Signature"),
                  createSignatureCell("Principal Signature & Stamp"),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 280 }, children: [] }),

          // 8. SECURITY FOOTER & METADATA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Official Record Generated via ${school.schoolName} Portal | Document Ref: RES-${result.id} | Generated: ${format(new Date(), "PPpp")}`,
                size: 15, // 7.5pt
                color: COLOR_MUTED,
                font: "Arial",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Helpers for Table Cell construction
function createMetadataCell(label: string, value: string, isHeaderRow = false): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    shading: { fill: isHeaderRow ? "F1F5F9" : "FFFFFF", type: ShadingType.CLEAR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `${label}: `,
            bold: true,
            size: 17,
            color: "475569",
            font: "Arial",
          }),
          new TextRun({
            text: value || "N/A",
            bold: true,
            size: 18,
            color: "0F172A",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function createTableHeaderCell(title: string, widthPct: number): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "1E3A8A" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "1E3A8A" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "334155" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "334155" },
    },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 17,
            color: "FFFFFF",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

type AlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType];

function createTableCell(
  text: string,
  align: AlignmentValue = AlignmentType.LEFT,
  isAlt = false,
  widthPct = 20,
  isBold = false
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: isAlt ? "F8FAFC" : "FFFFFF", type: ShadingType.CLEAR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    margins: { top: 90, bottom: 90, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: text,
            bold: isBold,
            size: 18,
            color: "0F172A",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function createTableSummaryCell(
  text: string,
  widthPct: number,
  align: AlignmentValue = AlignmentType.LEFT,
  isHighlight = false
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: isHighlight ? "FEF3C7" : "E2E8F0", type: ShadingType.CLEAR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "1E3A8A" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "1E3A8A" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: text,
            bold: true,
            size: 18,
            color: "1E3A8A",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function createSummaryCardCell(label: string, value: string): TableCell {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: label,
            bold: true,
            size: 15,
            color: "475569",
            font: "Arial",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 20,
            color: "1E3A8A",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function createSignatureCell(title: string): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "________________________",
            color: "94A3B8",
            font: "Arial",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 17,
            color: "334155",
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

// Download single result DOCX file
export async function downloadSingleResultDocx(
  result: Result,
  schoolInfo?: Partial<SchoolInfo>,
  studentInfo?: StudentInfo
): Promise<void> {
  const blob = await generateResultDocumentBlob(result, schoolInfo, studentInfo);
  const sanitizeName = (result.student_name || "Student").replace(/[^a-zA-Z0-9_-]/g, "_");
  const sanitizeRoll = (result.roll_number || "Roll").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Result_Class_${result.class}_${sanitizeName}_${sanitizeRoll}.docx`;
  saveAs(blob, filename);
}

// Batch download results in a ZIP archive
export async function downloadBatchResultsZip(
  results: Result[],
  schoolInfo?: Partial<SchoolInfo>,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  if (results.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder("Student_Results_DOCX");

  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    const blob = await generateResultDocumentBlob(item, schoolInfo);
    const sanitizeName = (item.student_name || `Student_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    const sanitizeRoll = (item.roll_number || `${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Class_${item.class}_${sanitizeName}_${sanitizeRoll}.docx`;

    if (folder) {
      folder.file(filename, blob);
    }
    if (onProgress) {
      onProgress(i + 1, results.length);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const dateStr = format(new Date(), "yyyy-MM-dd");
  saveAs(zipBlob, `PIISS_Student_Results_Batch_${dateStr}.zip`);
}
