import type { ReactElement } from "react";
import { cloneElement, useId } from "react";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorsToRender.map((e) => (
        <li key={e} className=" text-[10px] text-red-600">
          {e}
        </li>
      ))}
    </ul>
  );
}
type ErrorType = string | null | undefined;
export default function Input({
  label,
  input,
  errors,
  className = "",
  error,
}: {
  label?: ReactElement;
  input: ReactElement;
  errors?: ErrorType[];
  className?: string;
  error?: ErrorType; // TODO: delete this
}) {
  const errorsToRender = errors?.filter(Boolean) ?? error;
  const fallbackId = useId();
  const id = input.props.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={className}>
      {label
        ? cloneElement(label, {
            htmlFor: id,
            className: "block text-sm font-medium text-gray-700",
          })
        : null}
      <div className="mt-1">
        {cloneElement(input, {
          className:
            "w-full rounded border border-gray-500 px-2 py-1 text-lg h-12",
          id,
          "aria-invalid": errorId ? true : undefined,
          "aria-describedby": errorId,
        })}
      </div>
      {errorsToRender ? (
        <ErrorList
          id={errorId}
          errors={
            Array.isArray(errorsToRender) ? errorsToRender : [errorsToRender]
          }
        />
      ) : null}
    </div>
  );
}
