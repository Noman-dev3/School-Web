
"use server";

import nodemailer from "nodemailer";

interface EmailOptions {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "946167002@smtp-brevo.com",
      pass: "A72DYphZWBR3CfbJ",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${options.fromName}" <${options.fromEmail}>`,
      to: options.to,
      subject: `New Contact Form Inquiry: ${options.subject}`,
      html: options.html,
      replyTo: options.fromEmail,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: (error as Error).message };
  }
}
