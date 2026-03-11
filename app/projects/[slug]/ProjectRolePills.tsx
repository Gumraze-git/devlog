type ProjectRolePillsProps = {
  roleItems: string[];
};

export default function ProjectRolePills({ roleItems }: ProjectRolePillsProps) {
  if (roleItems.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {roleItems.map((roleItem) => (
        <span
          key={roleItem}
          className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] font-bold text-[var(--foreground)] shadow-sm"
        >
          {roleItem}
        </span>
      ))}
    </div>
  );
}
