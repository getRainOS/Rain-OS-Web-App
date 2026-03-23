import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary: "border-transparent bg-slate-800 text-slate-200",
        destructive: "border-transparent bg-red-500/15 text-red-500",
        outline: "text-white",
        success: "border-transparent bg-emerald-500/15 text-emerald-500",
        warning: "border-transparent bg-amber-500/15 text-amber-500",
        danger: "border-transparent bg-red-500/15 text-red-500",
        neutral: "border-transparent bg-zinc-800 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
