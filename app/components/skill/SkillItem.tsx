"use client";

type SkillItemProps = {
  label: string;
  active: boolean;
  icon: string;
};

export default function SkillItem({ label, active, icon }: SkillItemProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition ${
        active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
