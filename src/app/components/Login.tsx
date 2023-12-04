"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { type Login } from "@/server/api/schema/schema";
import { api } from "@/trpc/react";

const initialData: Login = { email: "", password: "" };

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  const handleChange = (name: keyof Login) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) return alert("Username or password incorrect");
    router.refresh();
    setData(initialData);
  };

  const { mutate: sendLink } = api.user.forgotPassword.useMutation();

  return (
    <Fragment>
      <button
        onClick={() =>
          sendLink({ email: "ru.ryanpratama@gmail.com" }, { onSuccess: () => alert("Password reset link sent") })
        }
        type="button"
      >
        I forgot my password
      </button>
      <form className="flex flex-col gap-2 bg-gray-100" onSubmit={handleSubmit}>
        <input
          value={data.email}
          onChange={handleChange("email")}
          className="p-2 border-2 border-gray-200 rounded-xl"
          type="email"
          required
        />
        <input
          value={data.password}
          onChange={handleChange("password")}
          className="p-2 border-2 border-gray-200 rounded-xl"
          type="password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <button
        type="button"
        onClick={async () => {
          const res = await fetch(`/api/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "ronaldoryan263@gmail.com" }),
          });
          if (!res.ok) return alert("Error occured, can't send email");
          alert("Email sent");
        }}
      >
        Send Email
      </button>
    </Fragment>
  );
}
