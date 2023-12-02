"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  createUser: (formData: FormData) => Promise<void>;
};

export default function Register({ createUser }: Props) {
  const { pending } = useFormStatus();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className="flex flex-col gap-2 bg-gray-100"
      action={async (formData: FormData) => {
        await createUser(formData);
        ref.current?.reset();
      }}
    >
      <input className="p-2 border-2 border-gray-200 rounded-xl" name="email" type="email" required />
      <input className="p-2 border-2 border-gray-200 rounded-xl" name="password" type="password" required />
      <button
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
