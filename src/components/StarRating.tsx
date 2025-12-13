import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

export function StarRating({ value, onChange, label, description }: StarRatingProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "transition-all duration-200 hover:scale-110",
              star <= value ? "text-yellow-500" : "text-muted-foreground"
            )}
          >
            <Star
              className="h-8 w-8"
              fill={star <= value ? "currentColor" : "none"}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold">{value}/5</span>
      </div>
    </div>
  );
}
