"use client";

import { Fragment } from "react";
import { api } from "~/trpc/react";

export default function Register() {
  const { mutate: registerUser, isError } = api.user.register.useMutation({ onError: (error) => alert(error.message) });

  const { data, isLoading } = api.user.detail.useQuery();

  return (
    <Fragment>
      <button
        disabled={isError}
        type="button"
        onClick={() => registerUser({ email: "dasdas@gmail.com", password: "realmadrid" })}
      >
        {isError ? "Close" : "Register"}
      </button>
      {isLoading ? "Loading..." : data?.email}
    </Fragment>
  );
}
