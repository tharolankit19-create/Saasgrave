import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthAside } from "@/components/auth-aside";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <AuthAside mode="login" />
      <div className="grave-grid flex items-center justify-center px-5 py-16">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
