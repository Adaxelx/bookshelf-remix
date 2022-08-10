import type { ReactNode } from "react";

export default function CatchBoundary({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded border border-red-900/10 bg-red-50 p-4 text-red-700"
      role="alert"
    >
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-red-600 p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
            />
          </svg>
        </span>

        <p>
          <strong className="text-xl font-medium">There is an error!</strong>

          <span className="block opacity-90">{children}</span>
        </p>
      </div>
    </div>
  );
}
