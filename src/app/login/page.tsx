import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grave-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
