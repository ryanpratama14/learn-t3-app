"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { UploadButton } from "~/lib/uploadthing";
import { api } from "~/trpc/react";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn("credentials", { ...data, redirect: false });

    if (!res?.error) {
      router.refresh();
    } else {
      alert("Username or password incorrect");
    }
  };

  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [name]: e.target.value });
  };

  const { data: user, isLoading } = api.user.detail.useQuery();

  const utils = api.useUtils();

  return (
    <Fragment>
      <section className="group relative h-32 aspect-square border-2 border-black">
        <UploadButton
          endpoint="uploadUserImage"
          className="opacity-0 absolute z-10 w-full h-full"
          appearance={{
            button: "w-full h-full",
            allowedContent: "hidden",
          }}
          onUploadProgress={() => {
            if (!loading) setLoading(true);
          }}
          onClientUploadComplete={async () => {
            await utils.invalidate();
            return setLoading(false);
          }}
        />
        {user?.image?.url && !loading && !isLoading ? (
          <Image
            alt="Profile Picture"
            src={user.image.url}
            width={1000}
            height={1000}
            className="object-cover absolute w-full h-full"
          />
        ) : null}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="absolute w-full h-full transition-all opacity-0 group-hover:opacity-100 bg-black/50" />
        )}
      </section>
      {loading ? <p>Uploading...</p> : null}
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
