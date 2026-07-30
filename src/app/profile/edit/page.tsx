import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/edit-profile-form";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/edit");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-lg px-5 py-14">
      <h1 className="mb-8 font-serif text-3xl tracking-tight text-ink">Edit your profile</h1>
      <EditProfileForm
        defaults={{
          full_name: profile?.full_name ?? "",
          avatar_url: profile?.avatar_url ?? "",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
          website_url: profile?.website_url ?? "",
          x_handle: profile?.x_handle ?? "",
          linkedin_url: profile?.linkedin_url ?? "",
          failed_count: profile?.failed_count ?? 0,
        }}
      />
    </div>
  );
}
