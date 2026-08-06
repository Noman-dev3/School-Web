import * as xlsx from 'xlsx';
import { supabase } from '@/lib/supabase';
import { FeeRecord, DynamicFeeField } from '@/app/admin/data-schemas';

export interface ImportPreviewItem {
  admNo: string;
  studentName: string;
  parentName: string;
  className: string;
  section: string;
  contactNo: string;
  feeMonth: string;
  tuitionFee: number;
  calculatedDiscount: number;
  examFee: number;
  arrears: number;
  customFields: DynamicFeeField[];
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
}

export interface ImportFileSummary {
  fileName: string;
  detectedClass: string;
  detectedSection: string;
  detectedMonth: string;
  standardTuition: number;
  totalStudents: number;
  totalDiscountedStudents: number;
  items: ImportPreviewItem[];
}

// Class Normalizer Helper
export function normalizeClassName(rawClass: string): { className: string; section: string } {
  if (!rawClass) return { className: 'Class 1', section: 'A' };
  
  const str = String(rawClass).trim().toUpperCase();

  let section = 'A';
  if (str.includes('BOYS')) section = 'Boys';
  else if (str.includes('GIRLS')) section = 'Girls';
  else if (str.includes('-B') || str.includes(' B')) section = 'B';

  if (str.includes('P.G') || str.includes('PG') || str.includes('PLAY')) return { className: 'Playgroup', section };
  if (str.includes('K.G') || str.includes('KG') || str.includes('NURSERY')) return { className: 'KG', section };
  if (str.includes('PREP')) return { className: 'Prep', section };
  if (str.includes('G-X') || str.includes('GX') || str.includes('GRADE 10') || str.includes('CLASS 10') || str.includes('G X')) return { className: 'Class 10', section };
  if (str.includes('G-IX') || str.includes('GIX') || str.includes('GRADE 9') || str.includes('CLASS 9') || str.includes('G IX')) return { className: 'Class 9', section };
  if (str.includes('G-VIII') || str.includes('G8') || str.includes('GRADE 8') || str.includes('CLASS 8') || str.includes('G VIII')) return { className: 'Class 8', section };
  if (str.includes('G-VII') || str.includes('G7') || str.includes('GRADE 7') || str.includes('CLASS 7') || str.includes('G VII')) return { className: 'Class 7', section };
  if (str.includes('G-VI') || str.includes('G6') || str.includes('GRADE 6') || str.includes('CLASS 6') || str.includes('G VI')) return { className: 'Class 6', section };
  if (str.includes('G-IV') || str.includes('G4') || str.includes('GRADE 4') || str.includes('CLASS 4') || str.includes('G IV')) return { className: 'Class 4', section };
  if (str.includes('G-V') || str.includes('G5') || str.includes('GRADE 5') || str.includes('CLASS 5') || str.includes('G V')) return { className: 'Class 5', section };
  if (str.includes('G-III') || str.includes('G3') || str.includes('GRADE 3') || str.includes('CLASS 3') || str.includes('G III')) return { className: 'Class 3', section };
  if (str.includes('G-II') || str.includes('G2') || str.includes('GRADE 2') || str.includes('CLASS 2') || str.includes('G II')) return { className: 'Class 2', section };
  if (str.includes('G-I') || str.includes('G1') || str.includes('GRADE 1') || str.includes('CLASS 1') || str.includes('G I')) return { className: 'Class 1', section };

  return { className: str, section };
}

// Parse Excel ArrayBuffer or File
export function parseExcelFile(arrayBuffer: ArrayBuffer, fileName: string): ImportFileSummary {
  const workbook = xlsx.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (!rows || rows.length < 2) {
    throw new Error(`File ${fileName} does not contain valid tabular data.`);
  }

  // Header detection
  const headerRowIdx = rows.findIndex(row => 
    Array.isArray(row) && row.some(cell => String(cell).includes('Student Name') || String(cell).includes('Adm'))
  );

  const headers: string[] = (headerRowIdx !== -1 ? rows[headerRowIdx] : rows[0]).map(h => String(h || '').trim());

  const getColIdx = (keyword: string) => headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));

  const admIdx = getColIdx('adm');
  const nameIdx = getColIdx('student name');
  const parentIdx = getColIdx('parent');
  const classIdx = getColIdx('class');
  const contactIdx = getColIdx('contact');
  const monthIdx = getColIdx('month');
  const tuitionIdx = getColIdx('tuition');
  const ccaIdx = getColIdx('cca');
  const examIdx = getColIdx('exam');
  const libIdx = getColIdx('library');
  const culturalIdx = getColIdx('cultural');
  const sportsIdx = getColIdx('sports');
  const transportIdx = getColIdx('transport');
  const arrearsIdx = getColIdx('arrears');
  const competitionIdx = getColIdx('competition');
  const totalIdx = getColIdx('net total');
  const receivedIdx = getColIdx('received');
  const remainingIdx = getColIdx('remaining');

  const rawItems: any[] = [];
  const tuitionFeeCounts: Record<number, number> = {};

  const dataRows = rows.slice(headerRowIdx !== -1 ? headerRowIdx + 1 : 1);

  dataRows.forEach(row => {
    if (!row || row.length === 0) return;

    const studentName = String(row[nameIdx] || '').trim();
    const admNo = String(row[admIdx] || '').trim();

    // Skip empty template rows or total summary rows
    if (!studentName || studentName === 'undefined' || studentName.length <= 1) return;
    const lowerName = studentName.toLowerCase();
    if (lowerName.includes('total') || lowerName.includes('slc') || lowerName.includes('record')) return;

    const parentName = String(row[parentIdx] || '').trim();
    const rawClass = String(row[classIdx] || '').trim();
    const contactNo = String(row[contactIdx] || '').trim();
    const feeMonth = String(row[monthIdx] || 'August').trim();

    const tuitionFee = Number(row[tuitionIdx]) || 0;
    const examFee = Number(row[examIdx]) || 0;
    const arrears = Number(row[arrearsIdx]) || 0;
    const netTotal = Number(row[totalIdx]) || 0;
    const totalReceived = Number(row[receivedIdx]) || 0;
    const remaining = Number(row[remainingIdx]) || 0;

    if (tuitionFee > 0) {
      tuitionFeeCounts[tuitionFee] = (tuitionFeeCounts[tuitionFee] || 0) + 1;
    }

    // Dynamic Extra Fields
    const customFields: DynamicFeeField[] = [];
    const addCustom = (name: string, idx: number) => {
      if (idx !== -1) {
        const amt = Number(row[idx]) || 0;
        customFields.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name, amount: amt });
      }
    };

    addCustom('CCA', ccaIdx);
    addCustom('Library', libIdx);
    addCustom('Cultural Event', culturalIdx);
    addCustom('Sports', sportsIdx);
    addCustom('Transport', transportIdx);
    addCustom('Competition', competitionIdx);

    rawItems.push({
      admNo: admNo || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName,
      parentName,
      rawClass,
      contactNo,
      feeMonth: feeMonth.includes('2026') ? feeMonth : `${feeMonth} 2026`,
      tuitionFee,
      examFee,
      arrears,
      customFields,
      netTotal,
      totalReceived,
      remaining,
    });
  });

  // Calculate Standard Class Tuition (Max Base Rate in the class)
  const tuitionList = rawItems.map(i => Number(i.tuitionFee) || 0).filter(t => t > 0);
  const standardTuition = tuitionList.length > 0 ? Math.max(...tuitionList) : 0;

  // Normalization & Custom Discount Calculation
  const firstItemClass = rawItems[0]?.rawClass || fileName;
  const { className: detectedClass, section: detectedSection } = normalizeClassName(firstItemClass);

  let discountedCount = 0;
  const items: ImportPreviewItem[] = rawItems.map(item => {
    const { className, section } = normalizeClassName(item.rawClass || detectedClass);
    
    // Custom Discount = Standard Class Tuition - Actual Student Tuition
    let calculatedDiscount = 0;
    if (standardTuition > 0 && item.tuitionFee > 0 && item.tuitionFee < standardTuition) {
      calculatedDiscount = standardTuition - item.tuitionFee;
      discountedCount++;
    }

    const calculatedTotal = (item.tuitionFee > 0 ? item.tuitionFee : standardTuition) +
      item.examFee + item.arrears +
      item.customFields.reduce((sum: number, c: DynamicFeeField) => sum + c.amount, 0);

    const totalAmount = item.netTotal > 0 ? item.netTotal : calculatedTotal;
    const amountPaid = item.totalReceived > 0 ? item.totalReceived : 0;
    const remaining = item.remaining > 0 ? item.remaining : (totalAmount - amountPaid);

    let status: 'paid' | 'pending' | 'overdue' | 'partial' = 'pending';
    if (amountPaid >= totalAmount && totalAmount > 0) status = 'paid';
    else if (amountPaid > 0 && amountPaid < totalAmount) status = 'partial';

    return {
      admNo: item.admNo,
      studentName: item.studentName,
      parentName: item.parentName,
      className,
      section,
      contactNo: item.contactNo,
      feeMonth: item.feeMonth,
      tuitionFee: item.tuitionFee > 0 ? item.tuitionFee : standardTuition,
      calculatedDiscount,
      examFee: item.examFee,
      arrears: item.arrears,
      customFields: item.customFields,
      totalAmount,
      amountPaid,
      remaining,
      status,
    };
  });

  return {
    fileName,
    detectedClass,
    detectedSection,
    detectedMonth: items[0]?.feeMonth || 'August 2026',
    standardTuition,
    totalStudents: items.length,
    totalDiscountedStudents: discountedCount,
    items,
  };
}

// Batch Database Executor for Students, Tariffs & Fee Vouchers
export async function executeDualImport(fileSummaries: ImportFileSummary[]) {
  let createdStudentsCount = 0;
  let createdTariffsCount = 0;
  let createdVouchersCount = 0;

  for (const summary of fileSummaries) {
    // 1. Save or Update Class Fee Structure / Tariff in fee_structures
    if (summary.standardTuition > 0) {
      try {
        const { data: existingStruct } = await supabase
          .from('fee_structures')
          .select('id')
          .eq('class_name', summary.detectedClass)
          .maybeSingle();

        if (existingStruct) {
          const { error: updateErr } = await supabase
            .from('fee_structures')
            .update({
              tuition_fee: summary.standardTuition,
              admission_fee: 0,
              exam_fee: 0,
              lab_fee: 0,
              is_public: true,
              kinship_enabled: true,
              kinship_discount_percent: 25
            })
            .eq('id', existingStruct.id);
          if (!updateErr) createdTariffsCount++;
          else console.error("Tariff update error:", updateErr);
        } else {
          const newStruct = {
            id: `struct-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            class_name: summary.detectedClass,
            tuition_fee: summary.standardTuition,
            admission_fee: 0,
            exam_fee: 0,
            lab_fee: 0,
            custom_fields: [],
            is_public: true,
            kinship_enabled: true,
            kinship_discount_percent: 25
          };
          const { error: insertErr } = await supabase
            .from('fee_structures')
            .insert([newStruct]);
          if (!insertErr) createdTariffsCount++;
          else console.error("Tariff insert error:", insertErr);
        }
      } catch (e) {
        console.error("Tariff save error:", e);
      }
    }

    // 2. Process Items: Auto-Create Students and Fee Vouchers
    for (const item of summary.items) {
      let studentId = '';
      try {
        // Search by Name & Class in students table
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('Name', item.studentName)
          .eq('Class', item.className)
          .maybeSingle();

        if (existingStudent) {
          studentId = String(existingStudent.id);
        } else {
          // DO NOT send custom string `id` because PostgreSQL students.id is a bigint auto-increment sequence!
          const { data: newStudent, error: studErr } = await supabase
            .from('students')
            .insert([{
              Name: item.studentName,
              Class: item.className,
              Section: item.section,
              Contact: item.contactNo || '',
              Date_Added: new Date().toISOString().split('T')[0],
              Gender: '',
              Address: '',
            }])
            .select('*')
            .maybeSingle();

          if (newStudent) {
            studentId = String(newStudent.id);
            createdStudentsCount++;
          } else if (studErr) {
            console.error("Student insert error:", studErr);
          }
        }
      } catch (e) {
        console.error("Student process error:", e);
      }

      // Generate Fee Voucher in 'fees' table
      try {
        const challanNumber = `CHS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const feeId = `fee-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error: voucherErr } = await supabase
          .from('fees')
          .insert([{
            id: feeId,
            challan_number: challanNumber,
            student_id: studentId || item.admNo || `STU-${Math.floor(100 + Math.random() * 900)}`,
            student_name: item.studentName,
            class_name: item.className,
            section: item.section,
            month_year: item.feeMonth,
            tuition_fee: item.tuitionFee,
            lab_fee: 0,
            exam_fee: item.examFee,
            arrears: item.arrears,
            discount: item.calculatedDiscount,
            custom_fields: item.customFields,
            total_amount: item.totalAmount,
            amount_paid: item.amountPaid,
            status: item.status,
            notes: item.parentName ? `Parent: ${item.parentName}` : '',
            created_at: new Date().toISOString()
          }]);

        if (!voucherErr) {
          createdVouchersCount++;
        } else {
          console.error("Voucher creation error:", voucherErr);
        }
      } catch (e) {
        console.error("Voucher process error:", e);
      }
    }
  }

  return {
    createdStudentsCount,
    createdTariffsCount,
    createdVouchersCount,
  };
}
