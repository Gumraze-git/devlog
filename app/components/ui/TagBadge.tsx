"use client";

import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

type TagBadgeTone = "default" | "overlay";
type TagBadgeSize = "xs" | "sm" | "md";

type TagBadgeProps = {
  label: string;
  active?: boolean;
  size?: TagBadgeSize;
  tone?: TagBadgeTone;
  href?: string;
  onClick?: () => void;
  ariaPressed?: boolean;
  className?: string;
  target?: ComponentPropsWithoutRef<"a">["target"];
  rel?: ComponentPropsWithoutRef<"a">["rel"];
  type?: ComponentPropsWithoutRef<"button">["type"];
  disabled?: ComponentPropsWithoutRef<"button">["disabled"];
};

const sizeClasses: Record<TagBadgeSize, string> = {
  xs: "px-2 py-0.5 text-[10px] leading-4",
  sm: "px-2.5 py-1 text-xs leading-4",
  md: "px-3 py-1.5 text-sm leading-5",
};

const baseClasses =
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

const toneClasses: Record<TagBadgeTone, { active: string; inactive: string }> = {
  default: {
    active: "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]",
    inactive:
      "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--foreground)]",
  },
  overlay: {
    active: "bg-white text-black border-white",
    inactive: "bg-white/5 text-white/80 border-white/20 hover:border-white/50 hover:text-white backdrop-blur-sm",
  },
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function TagBadge({
  label,
  active = false,
  size = "sm",
  tone = "default",
  href,
  onClick,
  ariaPressed,
  className,
  target,
  rel,
  type = "button",
  disabled,
}: TagBadgeProps) {
  const toneClass = active ? toneClasses[tone].active : toneClasses[tone].inactive;
  const classes = cx(baseClasses, sizeClasses[size], toneClass, className);

  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel}>
        {label}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type={type} onClick={onClick} className={classes} aria-pressed={ariaPressed} disabled={disabled}>
        {label}
      </button>
    );
  }

  return <span className={classes}>{label}</span>;
}
