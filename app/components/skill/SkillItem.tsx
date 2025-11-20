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
    <div className="group relative flex w-16 h-16 items-center justify-center overflow-hidden">
      <div
        className={`relative flex items-center justify-center transition-all h-[64px] w-[64px] ${
          active ? "" : "opacity-30 blur-[2px]"
        }`}
      >
        <Image src={image} alt={label} fill className="rounded-md object-contain shadow-md" style={{ transform: `scale(${scale})` }} />
      </div>
      <p className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full rounded bg-slate-900/80 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </p>
    </div>
  );
}
