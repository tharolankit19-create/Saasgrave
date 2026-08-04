import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthAside } from "@/components/auth-aside";

export const metadata = { title: "Get started" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <AuthAside mode="register" />
      <div className="grave-grid flex items-center justify-center px-5 py-16">
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </div>
  );
}
