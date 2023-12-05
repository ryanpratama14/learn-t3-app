import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";

type Props = {
  searchParams: Record<string, string | undefined>;
};

export default async function VerifyEmail({ searchParams }: Props) {
  const token = searchParams.token;
  if (!token) return notFound();

  const isTokenValid = await api.user.isTokenValid.query({ token });
  if (isTokenValid) return redirect("/expired-link");

  await api.user.verifyEmail.mutate({ token });

  return <p>Email has been verified, thank you</p>;
}
