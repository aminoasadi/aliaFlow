import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
