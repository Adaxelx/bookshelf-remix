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

const mapVariantToColor = (color: Color) => {
  switch (color) {
    case "default":
      return "accent";
    case "error":
      return "red";
  }
};

const getStyles = (variant: Variant, color: Color) => {
  const mappedColor = mapVariantToColor(color);
  switch (variant) {
    case "primary":
      return `bg-${mappedColor}-400 hover:bg-${mappedColor}-500 focus:bg-${mappedColor}-600 disabled:bg-gray-300 disabled:text-secondary-500`;
    case "secondary":
      return `border border-${mappedColor}-500 bg-${mappedColor}-100 hover:bg-${mappedColor}-500 focus:bg-${mappedColor}-600 disabled:bg-gray-300 disabled:text-secondary-500`;
    case "tertiary":
      return "";
  }
};

export default function Button({
  variant = "primary",
  size = "regular",
  colorVariant = "default",
  ...props
}: ButtonProps) {
  const generatedClassName = [
    getSize(size),
    getStyles(variant, colorVariant),
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
