import VercelInviteUserEmail from "@/emails/welcome";
import { schema } from "@/server/api/schema/schema";
import { env } from "@/env";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const validation = schema.forgotPassword.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }
    const { data, error } = await resend.emails.send({
      from: "Ryan <donotreply@ryanpratama.tech>",
      to: [validation.data.email],
      subject: "Hello World",
      react: VercelInviteUserEmail(validation.data),
    });
    if (error) return NextResponse.json({ error }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 404 });
  }
}
