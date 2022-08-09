export default function Card({
  src,
  alt,
  className = "",
  isBase = true,
}: CardProps) {
  return (
    <section className={`relative h-full w-full  bg-primary-600 ${className}`}>
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
