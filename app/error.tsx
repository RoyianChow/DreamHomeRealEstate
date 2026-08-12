"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-semibold text-red-700">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-red-950">The page could not be loaded</h1>
      <p className="mt-2 text-sm text-red-800">
        Try the request again. Database errors are kept server-side and are not shown here.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
