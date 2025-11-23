"use client";

import Image from "next/image";

type SkillItemProps = {
  label: string;
  active: boolean;
  image: string;
  size?: number; // 배율
};

export default function SkillItem({ label, active, image, size = 3 }: SkillItemProps) {
  const scale = Math.max(size, 0.5);

  return (
    <div
      className="group relative flex h-16 w-16 items-center justify-center focus:outline-none"
      tabIndex={0}
      aria-label={label}
    >
      <div
        className={`relative flex h-[64px] w-[64px] items-center justify-center rounded-md bg-[var(--icon-surface)] ring-1 ring-[var(--border)] transition-all ${
          active ? "" : "opacity-30 blur-[2px]"
        }`}
        style={{ zIndex: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
      >
        <Image
          src={image}
          alt={label}
          fill
          className="rounded-md object-contain shadow-md"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
      <p
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-0.5 -translate-x-1/2 translate-y-0.5 whitespace-nowrap rounded-lg bg-[color-mix(in_srgb,var(--foreground)_92%,transparent)] px-2 py-1 text-xs text-[var(--background)] shadow-lg ring-1 ring-[color-mix(in_srgb,var(--foreground)_24%,transparent)] opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        role="tooltip"
      >
        {label}
      </p>
    </div>
  );
}
