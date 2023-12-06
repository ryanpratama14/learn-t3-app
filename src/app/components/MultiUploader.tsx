"use client";

import { uploadFiles } from "@/lib/uploadthing";
import { isFileSizeAllowed } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";

export default function MultiUploader() {
  const { data: user, isFetching } = api.user.detail.useQuery();
  const utils = api.useUtils();

  const { mutate: uploadImage, isLoading } = useMutation({
    mutationFn: (file: File) => uploadFiles("uploadUserImage", { files: [file], input: { type: "profile-picture" } }),
    onSuccess: async () => {
      await utils.user.invalidate();
      alert("Uploaded successfully");
    },
    onError: (error) => {
      console.error(error);
      alert("Can't upload file");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isFileSizeAllowed("1MB", file.size)) {
      uploadImage(file);
    } else alert("Under 1MB plz");
  };

  return (
    <section className="group relative h-32 aspect-square border-2 border-black">
      <input
        accept="image/*"
        type="file"
        className="cursor-pointer absolute w-full h-full opacity-0 top-0 z-10"
        onChange={handleFileChange}
      />
      {user?.image?.url && !isLoading && !isFetching && (
        <Image
          alt="Profile Picture"
          src={user.image.url}
          width={1000}
          height={1000}
          className="object-cover absolute w-full h-full"
        />
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="absolute w-full h-full transition-all opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center">
          Change
        </div>
      )}
    </section>
  );
}
