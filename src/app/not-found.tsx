import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grave-grid flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 text-center">
      <div className="font-serif text-7xl text-ember-500">†</div>
      <h1 className="mt-4 font-serif text-3xl text-bone-100">This grave is empty</h1>
      <p className="mt-2 text-sm text-bone-500">The startup you&apos;re looking for was never buried here.</p>
      <div className="mt-7">
        <LinkButton href="/browse">Back to the graveyard</LinkButton>
      </div>
    </div>
  );
}
