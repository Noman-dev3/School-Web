'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AskAiInput {
    question: string;
    faqs: any;
    settings: any;
    teachers: any;
    events: any;
    toppers: any;
    boardStudents: any;
}

export async function askAI(input: AskAiInput): Promise<string> {
    const prompt = `You are a friendly, expert assistant for the Pakistan Islamic International School System (PIISS). Your goal is to answer the user's question based ONLY on the context provided below.

Be concise and helpful. If the answer isn't in the context, say "I'm sorry, I don't have that information. Please contact the school directly for more details." Do not make up information.

**User's Question:**
"${input.question}"

---
**Available Information (Context):**

**1. General Information & About Us:**
- **Our Story/About Us:** ${input.settings?.ourStory}
- **Contact Phone:** ${input.settings?.contactPhone}
- **Contact Email:** ${input.settings?.contactEmail}
- **Address:** ${input.settings?.contactAddress}
- **Office Hours:** ${input.settings?.officeHours}

**2. Frequently Asked Questions:**
${input.faqs?.map((faq: any) => `- **Q:** ${faq.question}  **A:** ${faq.answer}`).join('\n') || ''}

**3. Faculty/Teachers:**
${input.teachers?.map((t: any) => `- Teacher **${t.name}** is in the **${t.department}** department, has **${t.experience}** of experience, and can be contacted via **${t.contact}**.`).join('\n') || ''}

**4. School Events:**
${input.events?.map((e: any) => `- The event **"${e.title}"** is scheduled for **${e.date}**. Description: ${e.description}`).join('\n') || ''}

**5. Class Toppers (High Achievers):**
${input.toppers?.map((t: any) => `- **${t.name}** from Class **${t.class}** is a top performer with a score/grade of **${t.score}**.`).join('\n') || ''}

**6. Board Students Results:**
${input.boardStudents?.map((b: any) => `- **${b.name}** (Roll No: ${b.boardRollNo}) from Class **${b.class}** scored **${b.obtainedMarks}** out of **${b.totalMarks}** marks.`).join('\n') || ''}

---
Based SOLELY on the information above, please provide the best possible answer to the user's question. Do not mention that you are an AI. Just answer the question directly.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I'm sorry, I couldn't generate an answer at this time.";
    } catch (e) {
        console.error("Error calling Gemini API:", e);
        return "I'm sorry, there was an error processing your request. Please try again later.";
    }
}
