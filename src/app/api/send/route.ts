import VercelInviteUserEmail from "@/emails/welcome";
import { env } from "@/env";
import { getServerAuthSession } from "@/server/auth";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerAuthSession();
    // if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const validation = z.object({ email: z.string().email(), token: z.string() }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }
    const { email, token } = validation.data;
    const { data, error } = await resend.emails.send({
      from: "Ryan <donotreply@ryanpratama.tech>",
      to: [email],
      subject: "Hello World",
      react: VercelInviteUserEmail({ email, token }),
    });
    if (error) return NextResponse.json({ error });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
