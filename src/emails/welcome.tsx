import { env } from "@/env";
import { Body, Container, Head, Html, Link, Tailwind, Text } from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  email: string;
  token: string;
}

export const VercelInviteUserEmail = ({ email, token }: VercelInviteUserEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text>Hello {email}</Text>
            <Text>ようこそ！</Text>
            <Text>Click here to reset your password</Text>
            <Link href={`${env.NEXTAUTH_URL}/forgot-password/?token=${token}`}>Reset</Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VercelInviteUserEmail;
