"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";

type CTAButtonProps = PropsWithChildren<{
  href: string;
  label: string;
}>;

export default function CTAButton({ href, label, children }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--foreground)_88%,black)]"
    >
      <span>{label}</span>
      {children}
    </Link>
  );
}
