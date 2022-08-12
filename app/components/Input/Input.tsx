import type { ReactElement } from "react";
import { cloneElement } from "react";

export default function Input({
  label,
  input,
  error,
  className = "",
}: {
  label?: ReactElement;
  input: ReactElement;
  error: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      {label
        ? cloneElement(label, {
            className: "block text-sm font-medium text-gray-700",
          })
        : null}
      <div className="mt-1">
        {cloneElement(input, {
          className:
            "w-full rounded border border-gray-500 px-2 py-1 text-lg h-12",
          "aria-invalid": error ? true : undefined,
        })}
      </div>
      {error ? (
        <div className="pt-1 text-red-700" id="email-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}
