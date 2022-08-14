import type { HTMLAttributes } from "react";

export default function Card({
  src,
  alt,
  className = "",
  isBase = true,
  ...rest
}: CardProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      {...rest}
      className={`relative h-full w-full overflow-hidden rounded-xl bg-primary-600 ${className}`}
    >
      <img
        src={isBase ? `data:image/jpg;base64,${src}` : src}
        alt={alt}
        className="h-full w-full"
      />
    </section>
  );
}

interface CardProps {
  src: string;
  alt: string;
  className?: string;
  isBase?: boolean;
}
