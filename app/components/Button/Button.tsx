import type { LinkProps } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ButtonHTMLAttributes } from "react";

const isButtonALinkProps = (props: ElementProps): props is LinkProps =>
  Boolean((props as LinkProps).to);

type ElementProps = LinkProps | ButtonHTMLAttributes<HTMLButtonElement>;

type Variant = "primary" | "secondary" | "tertiary";

type Size = "regular" | "big";

type Color = "default" | "error";

type ButtonProps = ElementProps & {
  variant?: Variant;
  size?: Size;
  colorVariant?: Color;
};

const getSize = (size: Size) => {
  switch (size) {
    case "big":
      return "text-4xl py-5 px-8";
    default:
      return "base py-3 px-5";
  }
};

const buttonStyles: Record<Variant, Record<Color, string>> = {
  primary: {
    default:
      "bg-accent-400 hover:bg-accent-500 focus:bg-accent-600 disabled:bg-gray-300 disabled:text-secondary-500",
    error:
      "bg-red-400 hover:bg-red-500 focus:bg-red-600 disabled:bg-gray-300 disabled:text-secondary-500",
  },
  secondary: {
    default:
      "border border-accent-500 bg-accent-100 hover:bg-accent-500 focus:bg-accent-600 disabled:bg-gray-300 disabled:text-secondary-500",
    error:
      "border border-red-500 bg-red-100 hover:bg-red-500 focus:bg-red-600 disabled:bg-gray-300 disabled:text-secondary-500",
  },
  tertiary: {
    default:
      "bg-accent-400 hover:bg-accent-500 focus:bg-accent-600 disabled:bg-gray-300 disabled:text-secondary-500",
    error:
      "bg-red-400 hover:bg-red-500 focus:bg-red-600 disabled:bg-gray-300 disabled:text-secondary-500",
  },
};

export default function Button({
  variant = "primary",
  size = "regular",
  colorVariant = "default",
  ...props
}: ButtonProps) {
  const generatedClassName = [
    getSize(size),
    buttonStyles[variant][colorVariant],
    `rounded transition-colors inline-block text-secondary-800 ${
      props.className ?? ""
    }`,
  ].join(" ");

  if (isButtonALinkProps(props)) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <Link {...props} className={`text-center ${generatedClassName}`} />;
  }
  return <button {...props} className={generatedClassName} />;
}
