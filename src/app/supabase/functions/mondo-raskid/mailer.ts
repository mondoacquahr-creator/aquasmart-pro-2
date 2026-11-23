// Slanje e-pošte: preko vlastitog poslužitelja mail.mondo-acqua.hr (SMTP) kad je postavljena tajna SMTP_PASS,
// inače preko Resenda (stari način). Sučelje je isto kao resend.emails.send, pa ostatak koda ostaje nepromijenjen.
// Napomena: ova datoteka se kopira u svaku funkciju koja šalje e-poštu (mailer.ts uz index).
import nodemailer from "npm:nodemailer@6.9.16";
import { Resend } from "npm:resend";

type Attachment = { filename: string; content: string | Uint8Array };
type Message = {
  from?: string; to: string | string[]; subject: string; html?: string; text?: string;
  replyTo?: string; reply_to?: string; attachments?: Attachment[];
};

const SMTP_PASS = Deno.env.get("SMTP_PASS");
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "mail.mondo-acqua.hr";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || 465);
const SMTP_USER = Deno.env.get("SMTP_USER") || "info@mondo-acqua.hr";

/** Je li uključen vlastiti SMTP (tada pošiljatelj mora biti @mondo-acqua.hr). */
export const usingSmtp = !!SMTP_PASS;

// Poslužitelj prihvaća samo svoju adresu kao pošiljatelja: zadržavamo prikazano ime, adresa je SMTP_USER.
const fromSmtp = (from?: string) => {
  const name = (from?.match(/^\s*"?([^"<]+?)"?\s*</)?.[1] || "Mondo Acqua").trim();
  return `"${name.replace(/"/g, "")}" <${SMTP_USER}>`;
};

export function createMailer() {
  if (!usingSmtp) return new Resend(Deno.env.get("resend"));
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return {
    emails: {
      async send(m: Message) {
        try {
          const info = await transport.sendMail({
            from: fromSmtp(m.from),
            to: m.to,
            replyTo: m.replyTo || m.reply_to,
            subject: m.subject,
            html: m.html,
            text: m.text,
            attachments: m.attachments?.map((a) =>
              typeof a.content === "string"
                ? { filename: a.filename, content: a.content, encoding: "base64" }
                : { filename: a.filename, content: a.content }),
          });
          return { data: { id: info.messageId }, error: null };
        } catch (e) {
          console.error("SMTP greška", String(e));
          return { data: null, error: { message: String(e) } };
        }
      },
    },
  };
}
