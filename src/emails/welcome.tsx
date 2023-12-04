import { Body, Container, Head, Html, Tailwind, Text } from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  username?: string;
}

export const VercelInviteUserEmail = ({ username = "zenorocha" }: VercelInviteUserEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text>Hello {username}</Text>
            <Text>ようこそ！</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VercelInviteUserEmail;
