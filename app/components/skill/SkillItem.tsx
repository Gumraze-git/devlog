"use client";

import Image from "next/image";

type SkillItemProps = {
  label: string;
  active: boolean;
  image: string;
  size?: number; // rem 단위
};

export default function SkillItem({ label, active, image, size = 3 }: SkillItemProps) {
  return (
    <div
      className="group relative flex items-center justify-center"
      style={{ width: `${size}rem`, height: `${size}rem` }}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center transition-all ${
          active ? "" : "opacity-30 blur-[2px]"
        }`}
      >
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 640px) 16vw, (max-width: 1024px) 10vw, 6vw"
          className="rounded-md object-cover shadow-md"
        />
      </div>
      <p className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full rounded bg-slate-900/80 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </p>
    </div>
  );
}