import { Cpu, Thermometer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  compute: {
    icon: Cpu,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  cooling: {
    icon: Thermometer,
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  energy: {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
};

interface RecommendationCardProps extends Recommendation {
  className?: string;
}

export function RecommendationCard({
  title,
  description,
  impact,
  category,
  className,
}: RecommendationCardProps) {
  const cfg = categoryConfig[category] ?? categoryConfig.energy;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "bg-navy-card rounded-lg border border-navy-border flex flex-col",
        className
      )}
    >
      <div className="p-4 flex-1">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-md border flex-shrink-0 mt-0.5",
              cfg.bg
            )}
          >
            <Icon className={cn("w-4 h-4", cfg.color)} />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold leading-snug">
              {title}
            </h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-navy-border px-4 py-2.5 bg-green-500/5 rounded-b-lg">
        <p className="text-green-400 text-xs font-medium">{impact}</p>
      </div>
    </div>
  );
}
