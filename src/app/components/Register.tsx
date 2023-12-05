"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  createUser: (formData: FormData) => Promise<void>;
};

export default function Register({ createUser }: Props) {
  const { pending } = useFormStatus();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className="flex flex-col gap-2 bg-gray-100"
      action={async (formData: FormData) => {
        await createUser(formData);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, redirect: false });
        router.refresh();
        ref.current?.reset();
      }}
    >
      <input className="p-2 border-2 border-gray-200 rounded-xl" name="email" type="email" required />
      <input className="p-2 border-2 border-gray-200 rounded-xl" name="password" type="password" required />
      <button
        disabled={pending}
        type="submit"
        className={cn("p-2 bg-green-500 hover:bg-green-600 transition-all", {
          "bg-gray-600": pending,
        })}
      >
        Register
      </button>
    </form>
  );
}
