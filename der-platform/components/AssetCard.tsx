import { cn } from "@/lib/utils";

type Status = "good" | "warning" | "critical" | "idle";

const statusDot: Record<Status, string> = {
  good: "bg-green-400",
  warning: "bg-yellow-400",
  critical: "bg-red-400",
  idle: "bg-gray-500",
};

interface AssetCardProps {
  title: string;
  status: Status;
  rows: { label: string; value: string | number }[];
  className?: string;
}

export function AssetCard({ title, status, rows, className }: AssetCardProps) {
  return (
    <div
      className={cn(
        "bg-navy-card rounded-lg border border-navy-border p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot[status])}
        />
        <h3 className="text-white text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-start gap-3">
            <span className="text-gray-400 text-xs shrink-0">{row.label}</span>
            <span className="text-white text-xs font-medium text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
