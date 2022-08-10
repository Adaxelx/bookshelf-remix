import type { LinkProps } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ButtonHTMLAttributes } from "react";

const isButtonALinkProps = (props: ElementProps): props is LinkProps =>
  Boolean((props as LinkProps).to);

type ElementProps = LinkProps | ButtonHTMLAttributes<HTMLButtonElement>;

type Variant = "primary" | "secondary" | "tertiary";

type Size = "regular" | "big";

type ButtonProps = ElementProps & {
  variant?: Variant;
  size?: Size;
};

const getSize = (size: Size) => {
  switch (size) {
    case "big":
      return "text-4xl py-5 px-8";
    default:
      return "base py-3 px-5";
  }
};

const getStyles = (variant: Variant) => {
  switch (variant) {
    case "primary":
      return `bg-accent-400 hover:bg-accent-500 focus:bg-accent-600 disabled:bg-gray-300 disabled:text-secondary-500`;
    case "secondary":
      return `border border-accent-500 bg-accent-100 hover:bg-accent-500 focus:bg-accent-600 disabled:bg-gray-300 disabled:text-secondary-500`;
    case "tertiary":
      return "";
  }
};

export default function Button({
  variant = "primary",
  size = "regular",
  ...props
}: ButtonProps) {
  const generatedClassName = [
    getSize(size),
    getStyles(variant),
    `rounded transition-colors inline-block text-secondary-800 ${
      props.className ?? ""
    }`,
  ].join(" ");

  if (isButtonALinkProps(props)) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <Link {...props} className={generatedClassName} />;
  }
  return <button {...props} className={generatedClassName} />;
}
