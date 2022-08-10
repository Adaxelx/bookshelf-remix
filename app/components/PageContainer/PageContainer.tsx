import type { HTMLAttributes } from "react";

export default function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`min-h-full min-w-full bg-primary-100 p-3 ${className}`}
      {...props}
    />
  );
}
