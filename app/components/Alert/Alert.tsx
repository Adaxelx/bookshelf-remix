import type { HTMLAttributes, ReactNode } from "react";

const alertVariants = {
  success: `rounded border border-green-900/10 bg-green-50 p-4 text-green-700`,
  info: `rounded border border-sky-900/10 bg-sky-50 p-4 text-sky-700`,
  error: `rounded border border-red-900/10 bg-red-50 p-4 text-red-700`,
  warning: `rounded border border-amber-900/10 bg-amber-50 p-4 text-amber-700`,
};

export default function Alert({
  variant = "success",
  children,
  className = "",
  ...rest
}: AlertProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${alertVariants[variant]} ${className}`}
      role="alert"
      {...rest}
    >
      <strong className="text-sm font-medium">{children}</strong>
    </div>
  );
}

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

type AlertVariant = "success" | "info" | "warning" | "error";
