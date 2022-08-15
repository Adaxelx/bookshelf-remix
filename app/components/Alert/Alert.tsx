import type { HTMLAttributes, ReactNode } from "react";

export default function Alert({
  variant = "success",
  children,
  className = "",
  ...rest
}: AlertProps & HTMLAttributes<HTMLDivElement>) {
  const color = mapVariantToColor(variant);
  return (
    <div
      className={`rounded border border-${color}-900/10 bg-${color}-50 p-4 text-${color}-700 ${className}`}
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

const mapVariantToColor = (variant: AlertVariant) => {
  switch (variant) {
    case "success":
      return "green";
    case "info":
      return "sky";
    case "warning":
      return "amber";
    case "error":
      return "red";
  }
};
