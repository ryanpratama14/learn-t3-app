"use client";

import { api } from "@/trpc/react";
import { Fragment, useState } from "react";

type Data = {
  oldPassword: string;
  newPassword: string;
};

const initialData = {
  oldPassword: "",
  newPassword: "",
};

export default function ChangePassword() {
  const [data, setData] = useState(initialData);

  const handleChange = (name: keyof Data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    changePassword(data);
  };

  const { mutate: changePassword } = api.user.changePassword.useMutation({
    onError: () => alert("Incorrect old password"),
    onSuccess: () => {
      alert("Password changed");
      setData(initialData);
    },
  });

  const { mutate: sendToken } = api.user.sendVerificationEmail.useMutation({
    onError: (error) => alert(error.message),
    onSuccess: () => {
      alert("Email verification sent");
      setData(initialData);
    },
  });

  return (
    <Fragment>
      <form className="flex flex-col gap-2 bg-gray-100" onSubmit={handleSubmit}>
        <input
          value={data.oldPassword}
          onChange={handleChange("oldPassword")}
          className="p-2 border-2 border-gray-200 rounded-xl"
          type="password"
          required
        />
        <input
          value={data.newPassword}
          onChange={handleChange("newPassword")}
          className="p-2 border-2 border-gray-200 rounded-xl"
          type="password"
          required
        />
        <button type="submit">Update Password</button>
      </form>
      <button type="button" onClick={() => sendToken({ email: "ru.ryanpratama@gmail.com" })}>
        Verify my email
      </button>
    </Fragment>
  );
}
