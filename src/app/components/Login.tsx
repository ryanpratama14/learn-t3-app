"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { type Login } from "@/server/api/schema/schema";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState<Login>({ email: "", password: "" });

  const handleChange = (name: keyof Login) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn("credentials", { ...data, redirect: false });
    if (!res?.error) return router.refresh();
    alert("Username or password incorrect");
  };

  return (
    <Fragment>
      <form className="flex flex-col gap-2 bg-gray-100" onSubmit={handleSubmit}>
        <input onChange={handleChange("email")} className="p-2 border-2 border-gray-200 rounded-xl" type="email" required />
        <input
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
