import { env } from "@/env";
import { type Email } from "@/server/api/schema/schema";
import { Body, Container, Head, Html, Link, Tailwind, Text } from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  email: string;
  token: string;
  type: Email;
}

export const VercelInviteUserEmail = ({ email, token, type }: VercelInviteUserEmailProps) => {
  const isVerify = type === "VERIFY" ? true : false;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text>Hello {email}</Text>
            <Text>ようこそ！</Text>
            <Text>Click here to {isVerify ? "verify your email" : "reset your password"}</Text>
            <Link href={`${env.NEXTAUTH_URL}/${isVerify ? "verify-email" : "forgot-password"}/?token=${token}`}>Submit</Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VercelInviteUserEmail;
