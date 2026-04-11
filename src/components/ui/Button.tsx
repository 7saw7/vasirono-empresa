import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

type ChildWithClassNameProps = {
  className?: string;
  children?: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-300",
  secondary:
    "bg-white text-neutral-950 border border-neutral-200 hover:bg-neutral-50 disabled:text-neutral-400",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-sm rounded-2xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild) {
    const child = React.Children.only(
      props.children
    ) as React.ReactElement<ChildWithClassNameProps>;

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return <button className={classes} {...props} />;
}