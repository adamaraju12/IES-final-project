import { cn } from "@/lib/utils";

type BadgeColor = "green" | "yellow" | "red" | "blue" | "gray" | "cyan";

const colorMap: Record<BadgeColor, string> = {
  green: "bg-green-500/15 text-green-400 border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  gray: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  cyan: "bg-accent/15 text-accent border-accent/30",
};

interface StatusBadgeProps {
  text: string;
  color: BadgeColor;
  className?: string;
}

export function StatusBadge({ text, color, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorMap[color],
        className
      )}
    >
      {text}
    </span>
  );
}
