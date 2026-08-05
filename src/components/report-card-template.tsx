import React, { forwardRef } from 'react';
import { Result } from "@/app/admin/content-management/results/data/schema";
import { format } from 'date-fns';

interface ReportCardTemplateProps {
    result: Result;
    schoolDetails: {
        schoolName: string;
        tagline: string;
        phone: string;
        email: string;
        address: string;
    };
}

export const ReportCardTemplate = forwardRef<HTMLDivElement, ReportCardTemplateProps>(
    ({ result, schoolDetails }, ref) => {
        return (
            <div
                ref={ref}
                className="w-[800px] bg-white p-10 font-sans text-black relative"
                style={{
                    boxSizing: 'border-box',
                }}
            >
                {/* Border layer */}
                <div className="absolute inset-4 border-[6px] border-double border-blue-900 rounded-sm pointer-events-none" />

                {/* Header Section */}
                <div className="text-center mb-8 pt-4">
                    <h1 className="text-3xl font-bold text-blue-900 mb-1 uppercase tracking-wide">
                        {schoolDetails.schoolName || 'PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM'}
                    </h1>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-widest border-b-2 border-blue-900 pb-2 inline-block">
                        {schoolDetails.tagline || 'Excellence in Education'}
                    </p>
                    <div className="flex justify-center gap-6 mt-3 text-xs text-gray-600">
                        {schoolDetails.phone && <span>📞 {schoolDetails.phone}</span>}
                        {schoolDetails.email && <span>✉️ {schoolDetails.email}</span>}
                        {schoolDetails.address && <span>📍 {schoolDetails.address}</span>}
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-blue-900 text-white inline-block px-6 py-1.5 rounded-full shadow-sm">
                        OFFICIAL RESULT CARD
                    </h2>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-32 text-blue-900">Student Name:</span>
                        <span className="uppercase font-semibold text-gray-800">{result.student_name}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-32 text-blue-900">Roll Number:</span>
                        <span className="font-mono">{result.roll_number}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-32 text-blue-900">Class:</span>
                        <span className="font-semibold">{result.class}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-32 text-blue-900">Session:</span>
                        <span className="font-semibold">{result.session}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-32 text-blue-900">Date Issued:</span>
                        <span className="font-semibold">{format(new Date(), 'dd MMM yyyy')}</span>
                    </div>
                </div>

                {/* Marks Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-blue-900">
                                <th className="border border-gray-400 p-2 text-left font-bold uppercase w-1/2">Subjects</th>
                                <th className="border border-gray-400 p-2 text-center font-bold uppercase">Total Marks</th>
                                <th className="border border-gray-400 p-2 text-center font-bold uppercase">Marks Obtained</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(result.subjects).map(([subject, marks]) => (
                                <tr key={subject}>
                                    <td className="border border-gray-400 p-2 font-semibold text-gray-800">{subject}</td>
                                    <td className="border border-gray-400 p-2 text-center font-mono text-gray-600">100</td>
                                    <td className="border border-gray-400 p-2 text-center font-mono font-bold">{marks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Box */}
                <div className="bg-gray-50 border-2 border-gray-300 p-4 rounded-lg mb-12 flex justify-between items-center px-10">
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Marks</p>
                        <p className="text-2xl font-black text-gray-800 font-mono">
                            {result.total_marks} <span className="text-sm font-medium text-gray-500">/ {result.max_marks}</span>
                        </p>
                    </div>
                    <div className="h-10 w-px bg-gray-300"></div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Percentage</p>
                        <p className="text-2xl font-black text-gray-800 font-mono">{result.percentage}%</p>
                    </div>
                    <div className="h-10 w-px bg-gray-300"></div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Grade</p>
                        <p className="text-3xl font-black text-blue-900 font-mono">{result.grade}</p>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 mt-12 px-8">
                    <div className="text-center border-t border-gray-400 pt-2">
                        <p className="text-sm font-bold text-gray-600 uppercase">Class Teacher Signature</p>
                    </div>
                    <div className="text-center border-t border-gray-400 pt-2">
                        <p className="text-sm font-bold text-gray-600 uppercase">Principal Signature</p>
                    </div>
                </div>
                
                {/* Footer Watermark */}
                 <div className="absolute bottom-4 left-0 right-0 text-center">
                     <p className="text-[10px] text-gray-400 tracking-widest">GENERATED BY PIISS MANAGEMENT SYSTEM</p>
                 </div>
            </div>
        );
    }
);
ReportCardTemplate.displayName = 'ReportCardTemplate';
