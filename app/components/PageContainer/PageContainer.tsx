import type { HTMLAttributes } from "react";

export default function PageContainer({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`flex min-h-full min-w-full justify-center bg-primary-100 p-3 align-top xl:min-w-0`}
    >
      <div
        className={`flex max-w-full grow flex-col xl:max-w-screen-xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
