"use client";

import React from "react";
import { api } from "~/trpc/react";

export default function Register() {
  const { mutate: registerUser, isError } = api.user.register.useMutation({
    onError: () => alert("User has already register"),
  });

  const handleSubmit = async () => {
    registerUser({ email: "dasdas@gmail.com", password: "realmadrid" });
  };

  return (
    <button disabled={isError} type="button" onClick={handleSubmit}>
      {isError ? "Close" : "Register"}
    </button>
  );
}
