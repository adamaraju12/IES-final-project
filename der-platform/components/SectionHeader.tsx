import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <h2 className="text-accent text-lg font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
