import { cn } from "@/lib/utils";

interface KPITileProps {
  label: string;
  value: string | number;
  unit?: string;
  context?: string;
  highlight?: boolean;
  className?: string;
}

export function KPITile({
  label,
  value,
  unit,
  context,
  highlight,
  className,
}: KPITileProps) {
  return (
    <div
      className={cn(
        "bg-navy-card rounded-lg p-4 border",
        highlight ? "border-accent/40" : "border-navy-border",
        className
      )}
    >
      <p className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-white leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-accent text-sm font-semibold">{unit}</span>
        )}
      </div>
      {context && (
        <p className="text-gray-500 text-xs mt-2 leading-snug">{context}</p>
      )}
    </div>
  );
}
