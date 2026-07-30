"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Uploads a real image file to Supabase Storage and hands back the public URL.
// Buckets ("avatars", "logos", "screenshots") are created by supabase/schema.sql.
export function ImageUpload({
  bucket,
  value,
  onChange,
  label,
  shape = "square",
  hint,
}: {
  bucket: "avatars" | "logos" | "screenshots";
  value: string;
  onChange: (url: string) => void;
  label: string;
  shape?: "square" | "circle";
  hint?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return toast.error("Please sign in again.");
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded.");
  }

  const rounded = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div>
      <span className="mb-1.5 flex text-xs font-medium text-ink-faint">
        {label}
        {hint && <span className="ml-auto text-ink-faint">{hint}</span>}
      </span>
      <div className="flex items-center gap-4">
        <div className={`relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-line bg-card ${rounded}`}>
          {value ? (
            <>
              <Image src={value} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <span className="text-ink-faint">
              <Upload size={20} />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink transition hover:border-ink/25 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {value ? "Replace" : "Upload image"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
