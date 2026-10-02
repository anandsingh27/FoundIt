import SignupForm from "@/components/SignupForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <div className="card-index w-full rounded-sm p-6 sm:p-8">
        <p className="font-stamp text-xs uppercase tracking-[0.25em] text-amber-dark">Join the board</p>
        <h1 className="mt-1 mb-6 font-display text-2xl font-semibold text-forest-dark">
          Create an account
        </h1>
        <SignupForm next={next} />
      </div>
    </div>
  );
}
