"use client";

import { api } from "@/trpc/react";
import { redirect, useSearchParams } from "next/navigation";
import React, { useState } from "react";

type Data = {
  password: string;
  confirmPassword: string;
};

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const newParams = new URLSearchParams(searchParams.toString());

  const token = newParams.get("token");
  if (!token) return redirect("/");

  const { data: isExpired } = api.user.isForgotPasswordTokenExpired.useQuery({ token });
  if (isExpired) return redirect("/expired-link");

  const [data, setData] = useState<Data>({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name: keyof Data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [name]: e.target.value });
  };

  const { mutate: updatePassword } = api.user.updatePassword.useMutation({
    onSuccess: () => {
      alert("Password changed");
      redirect("/");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) return alert("Password doesn't match");
    updatePassword({ token, newPassword: data.password });
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input className="border" type="password" onChange={handleChange("password")} value={data.password} />
      <input className="border" type="password" onChange={handleChange("confirmPassword")} value={data.confirmPassword} />
      <button type="submit">Submit</button>
    </form>
  );
}
