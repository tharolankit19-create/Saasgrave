import { LinkButton } from "@/components/ui";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 text-center">
      <LogoMark className="h-14 w-14 opacity-40" />
      <h1 className="mt-6 font-serif text-3xl text-bone-100">Page not found</h1>
      <p className="mt-2 text-sm text-bone-500">The listing you&apos;re looking for isn&apos;t here.</p>
      <div className="mt-7">
        <LinkButton href="/browse">Browse listings</LinkButton>
      </div>
    </div>
  );
}
