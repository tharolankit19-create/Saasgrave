"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Multi-image uploader for product screenshots. Appends public URLs to an
// array (max `max`). Files land in the "screenshots" storage bucket.
export function GalleryUpload({
  value,
  onChange,
  max = 5,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    const room = max - value.length;
    if (room <= 0) return toast.error(`Up to ${max} screenshots.`);
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return toast.error("Please sign in again.");
    }

    const added: string[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5 MB — skipped.`);
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
      if (error) {
        toast.error(error.message);
        continue;
      }
      added.push(supabase.storage.from("screenshots").getPublicUrl(path).data.publicUrl);
    }
    onChange([...value, ...added]);
    setUploading(false);
  }

  return (
    <div>
      <span className="mb-1.5 flex text-xs font-medium text-bone-500">
        Screenshots <span className="ml-auto text-bone-500/60">up to {max}, optional</span>
      </span>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative h-20 w-28 overflow-hidden rounded-lg border border-black/10">
            <Image src={url} alt="" fill className="object-cover" sizes="112px" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-bone-100 hover:bg-black"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="grid h-20 w-28 place-items-center rounded-lg border border-dashed border-black/12 text-bone-500 transition hover:border-accent-500/40 hover:text-accent-400 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
