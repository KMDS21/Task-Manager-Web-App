import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        pending: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
        in_progress: "border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
        completed: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        admin: "border-transparent bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
        user: "border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
