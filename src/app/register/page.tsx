import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Get started" };

export default function RegisterPage() {
  return (
    <div className="grave-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
