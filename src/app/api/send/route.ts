import VercelInviteUserEmail from "@/emails/welcome";
import { schema } from "@/server/api/schema/schema";
import { env } from "@/env";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const validation = z.object({ email: z.string().email(), token: z.string(), type: schema.email }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }
    const { email, token, type } = validation.data;
    const { data, error } = await resend.emails.send({
      from: "Ryan <donotreply@ryanpratama.tech>",
      to: [email],
      subject: "Hello World",
      react: VercelInviteUserEmail({ email, token, type }),
    });
    if (error) return NextResponse.json({ error });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
