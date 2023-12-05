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
  const [email, setEmail] = useState("");

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

  const { mutate: sendToken } = api.user.sendForgotPasswordEmail.useMutation({
    onSuccess: () => alert("Password reset link sent"),
    onError: (error) => alert(error.message),
  });

  return (
    <Fragment>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendToken({ email });
        }}
      >
        <input className="p-2 border-2 border-gray-200 rounded-xl" type="email" onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Send reset password link</button>
      </form>

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
    </Fragment>
  );
}
