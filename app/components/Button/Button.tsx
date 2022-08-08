import type { LinkProps } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ButtonHTMLAttributes } from "react";

const isButtonALinkProps = (props: ElementProps): props is LinkProps =>
  Boolean((props as LinkProps).to);

type ElementProps = LinkProps | ButtonHTMLAttributes<HTMLButtonElement>;

type Variant = "primary" | "secondary" | "tertiary";

type ButtonProps = ElementProps & {
  variant?: Variant;
};

const getStyles = (variant: Variant) => {
  switch (variant) {
    case "primary":
      return "rounded bg-accent-400 py-3 px-5";
    case "secondary":
      return "";
    case "tertiary":
      return "";
  }
};

export default function Button({ variant = "primary", ...props }: ButtonProps) {
  const className = [
    getStyles(variant),
    `inline-block text-secondary-800 ${props.className ?? ""}`,
  ].join(" ");

  if (isButtonALinkProps(props)) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <Link {...props} className={className} />;
  }
  return <button className={className} />;
}
