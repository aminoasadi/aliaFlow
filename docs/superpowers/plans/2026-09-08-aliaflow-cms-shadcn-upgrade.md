# Aliaflow CMS shadcn/ui Upgrade + Dashboard + Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled admin UI primitives with real shadcn/ui components (New York style, light theme), add a Dashboard landing page and a Media Library page, and fix the upload-storage bug this work surfaces (uploads currently live under `public/`, which Next.js snapshots at build time).

**Architecture:** Real shadcn/ui component source (fetched from the official registry, adapted for Tailwind v3 and this project's conventions) replaces `work/aliaflow-nextjs/components/ui/*`. A new `@/*` path alias is added for these and all new admin files. Uploaded images move from `public/uploads/` to a private `storage/uploads/`, served through a dedicated route handler so the public URL shape (`/uploads/<file>`) never changes for existing callers.

**Tech Stack:** Adds `radix-ui` (unified Radix primitives package) and `lucide-react` (icons) to the existing Next.js 15 / Prisma / Tailwind v3 stack.

## Global Constraints

- Next.js version is 15.5.2 — dynamic route `params` are `Promise`s and must be awaited.
- TypeScript `strict: true` is on.
- Tailwind is pinned to the v3 line (`^3.4.19` already installed) — every ported shadcn file must use Tailwind v3-compatible class syntax. The registry source uses Tailwind v4's parenthesis arbitrary-value shorthand (`w-(--sidebar-width)`); wherever this plan's code blocks show that form already converted to `w-[var(--sidebar-width)]` (bracket + explicit `var()`), use it exactly as shown — don't reintroduce the parenthesis form.
- `darkMode` must be set to `"class"` in `tailwind.config.ts` (Tailwind v3's default is `"media"`, which would activate the ported components' `dark:` classes based on the visitor's OS preference — this project is light-only, and nothing ever adds a `dark` class, so `"class"` mode means those `dark:` variants simply never apply).
- `corePlugins.preflight: false` stays; `app/admin/admin.css` is still imported only from admin-specific files, never `app/layout.tsx` — the public site's appearance must not change.
- No consumer of `components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, or `card.tsx` needs to change when those files are replaced — the real shadcn versions are prop-compatible supersets of the hand-rolled ones they replace (same variant/size names, same component names). Only genuinely new UI (Dashboard, Media Library, sidebar, upload storage) touches consumer code.
- All commands run with `work/aliaflow-nextjs` as the working directory.
- Session cookie name stays `aliaflow_session` (`SESSION_COOKIE_NAME` in `lib/auth.ts`) — do not rename it.

---

### Task 1: Dependencies, path alias, and shadcn theme wiring

**Files:**
- Modify: `work/aliaflow-nextjs/package.json`
- Modify: `work/aliaflow-nextjs/tsconfig.json`
- Modify: `work/aliaflow-nextjs/tailwind.config.ts`
- Modify: `work/aliaflow-nextjs/app/admin/admin.css`

**Interfaces:**
- Produces: the `@/*` import alias (resolves to the project root), and the shadcn CSS variable/Tailwind token set that every component added in Tasks 2-3 depends on.

- [ ] **Step 1: Install dependencies**

```bash
npm install radix-ui lucide-react
```

- [ ] **Step 2: Add the path alias**

In `work/aliaflow-nextjs/tsconfig.json`, add `"baseUrl"` and `"paths"` to `compilerOptions` (keep every existing key as-is, just add these two):

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Extend the Tailwind config with shadcn tokens**

Replace the full contents of `work/aliaflow-nextjs/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/admin/**/*.{ts,tsx}",
    "./components/admin/**/*.{ts,tsx}",
    "./components/ui/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Define the theme's CSS variables**

Replace the full contents of `work/aliaflow-nextjs/app/admin/admin.css` (this file is only ever imported from admin-specific pages/layouts, so these variables never reach the public site):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f8fafc;
  --foreground: #1e293b;
  --card: #ffffff;
  --card-foreground: #1e293b;
  --popover: #ffffff;
  --popover-foreground: #1e293b;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --secondary: #e5e7eb;
  --secondary-foreground: #374151;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --accent: #e0e7ff;
  --accent-foreground: #374151;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #d1d5db;
  --input: #d1d5db;
  --ring: #6366f1;
  --radius: 0.5rem;
  --sidebar: #f3f4f6;
  --sidebar-foreground: #1e293b;
  --sidebar-primary: #6366f1;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e0e7ff;
  --sidebar-accent-foreground: #374151;
  --sidebar-border: #d1d5db;
  --sidebar-ring: #6366f1;
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0 (no `@/*`-importing files exist yet, so nothing new to resolve, but this confirms the config edits didn't break anything).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json tailwind.config.ts app/admin/admin.css
git commit -m "Add shadcn theme tokens, path alias, and radix-ui/lucide-react dependencies"
```

---

### Task 2: Replace core UI primitives with real shadcn/ui components

**Files:**
- Modify: `work/aliaflow-nextjs/components/ui/button.tsx`
- Modify: `work/aliaflow-nextjs/components/ui/input.tsx`
- Modify: `work/aliaflow-nextjs/components/ui/textarea.tsx`
- Modify: `work/aliaflow-nextjs/components/ui/label.tsx`
- Modify: `work/aliaflow-nextjs/components/ui/card.tsx`

**Interfaces:**
- Produces: drop-in replacements — same exported names (`Button`, `Input`, `Textarea`, `Label`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, plus newly-added `CardDescription`/`CardFooter`/`CardAction`/`buttonVariants`) with the same variant/size prop values every existing caller already uses (`variant="outline"|"secondary"|"destructive"|"ghost"|"default"`, `size="sm"|"default"`).
- Consumes: `cn` from `@/lib/utils` (already exists at `lib/utils.ts` from the original build — no change needed there, it's just now also reachable via the new alias).

This is a pure visual/primitive swap — no existing consumer (`DynamicSectionForm.tsx`, admin pages) needs to change. Verified by type-checking and by the running dev server rendering correctly in Step 7.

- [ ] **Step 1: Replace the Button primitive**

Replace the full contents of `work/aliaflow-nextjs/components/ui/button.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

- [ ] **Step 2: Replace the Input primitive**

Replace the full contents of `work/aliaflow-nextjs/components/ui/input.tsx`:

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

- [ ] **Step 3: Replace the Textarea primitive**

Replace the full contents of `work/aliaflow-nextjs/components/ui/textarea.tsx`:

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

- [ ] **Step 4: Replace the Label primitive**

Replace the full contents of `work/aliaflow-nextjs/components/ui/label.tsx`:

```tsx
"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
```

- [ ] **Step 5: Replace the Card primitive**

Replace the full contents of `work/aliaflow-nextjs/components/ui/card.tsx`:

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

(Note: the registry source used a `@container/card-header` class on `CardHeader` for container-query-based responsive layout. This project has no container-query plugin installed and doesn't need one for anything in this plan, so that class is omitted here — everything else is unchanged.)

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 7: Manually verify nothing visually broke**

```bash
npm run dev &
sleep 3
```

Log in at `http://localhost:3000/admin/login` (admin@aliaflow.com / change-me-please from `.env`), open any section editor, and confirm: the page still renders (inputs, textareas, save button, cards around list items all still show up and are usable — they'll look slightly different, that's expected, this task is exactly the primitive swap). Then:

```bash
kill %1
```

- [ ] **Step 8: Commit**

```bash
git add components/ui/button.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/label.tsx components/ui/card.tsx
git commit -m "Replace hand-rolled UI primitives with real shadcn/ui components"
```

---

### Task 3: Add the sidebar dependency chain and remaining primitives

**Files:**
- Create: `work/aliaflow-nextjs/hooks/use-mobile.ts`
- Create: `work/aliaflow-nextjs/components/ui/separator.tsx`
- Create: `work/aliaflow-nextjs/components/ui/skeleton.tsx`
- Create: `work/aliaflow-nextjs/components/ui/tooltip.tsx`
- Create: `work/aliaflow-nextjs/components/ui/sheet.tsx`
- Create: `work/aliaflow-nextjs/components/ui/sidebar.tsx`
- Create: `work/aliaflow-nextjs/components/ui/alert-dialog.tsx`
- Create: `work/aliaflow-nextjs/components/ui/sonner.tsx`
- Create: `work/aliaflow-nextjs/components/ui/badge.tsx`
- Create: `work/aliaflow-nextjs/components/ui/avatar.tsx`
- Create: `work/aliaflow-nextjs/components/ui/dropdown-menu.tsx`
- Modify: `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx` (only to swap the `Toaster` import source — see Step 12; the sidebar rewrite itself is Task 7)

**Interfaces:**
- Produces: `Sidebar` + its sub-components + `useSidebar` (from `components/ui/sidebar.tsx`, consumed by Task 7's `AppSidebar`), `AlertDialog` + sub-components (consumed by Task 9's `MediaDeleteButton`), `Toaster` (from `components/ui/sonner.tsx`, consumed by Task 7's layout), `Badge` (consumed by Task 9), `Avatar`/`AvatarFallback` (consumed by Task 7), `DropdownMenu` + sub-components (consumed by Task 7).
- Consumes: `cn` from `@/lib/utils`, `Button` from `@/components/ui/button`, `Input`/`Separator`/`Sheet*`/`Skeleton`/`Tooltip*` from their respective new files (all via the `@/` alias), `useIsMobile` from `@/hooks/use-mobile`.

No new consumers are wired up in this task — everything here is additive file creation, verified by type-checking only. Tasks 7 and 9 wire them into actual pages.

- [ ] **Step 1: The mobile-detection hook**

Create `work/aliaflow-nextjs/hooks/use-mobile.ts`:

```ts
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

- [ ] **Step 2: Separator, Skeleton, Tooltip**

Create `work/aliaflow-nextjs/components/ui/separator.tsx`:

```tsx
"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
```

Create `work/aliaflow-nextjs/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

Create `work/aliaflow-nextjs/components/ui/tooltip.tsx`:

```tsx
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit origin-[var(--radix-tooltip-content-transform-origin)] animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

- [ ] **Step 3: Sheet (mobile sidebar dependency)**

Create `work/aliaflow-nextjs/components/ui/sheet.tsx`:

```tsx
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

- [ ] **Step 4: The Sidebar component**

Create `work/aliaflow-nextjs/components/ui/sidebar.tsx`. This is a direct port of the official component; the three `w-(--sidebar-width)` occurrences from the registry source are already converted to bracket syntax below per the Global Constraints — write it exactly as shown:

```tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
```

(This port intentionally drops `SidebarInput`, `SidebarSeparator`, `SidebarRail`, `SidebarGroupAction`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, and the `SidebarMenuSub*` family from the official file — none of them are used by this plan's `AppSidebar` in Task 7, and per YAGNI there's no reason to carry dead exports. If a future change needs one, re-fetch it from the same official source.)

- [ ] **Step 5: Dialog-family primitives — AlertDialog**

Create `work/aliaflow-nextjs/components/ui/alert-dialog.tsx`:

```tsx
"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <Button asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <Button variant="outline" asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
```

(Simplified from the registry source: dropped the `size="sm"` variant and `AlertDialogMedia` — this plan's one use, the Media Library delete confirmation, needs only the default size and no media slot.)

- [ ] **Step 6: Sonner toast wrapper**

Create `work/aliaflow-nextjs/components/ui/sonner.tsx`. This project is light-only and doesn't install `next-themes`, so — unlike the registry source — the theme is hardcoded rather than read from a theme provider:

```tsx
"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
```

- [ ] **Step 7: Badge**

Create `work/aliaflow-nextjs/components/ui/badge.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
```

(Simplified from the registry source: dropped the `ghost`/`link` variants — this plan only ever uses `secondary`, kept `default`/`destructive`/`outline` too since they're free and commonly needed.)

- [ ] **Step 8: Avatar**

Create `work/aliaflow-nextjs/components/ui/avatar.tsx`:

```tsx
"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
```

(Dropped `AvatarBadge`/`AvatarGroup`/`AvatarGroupCount` from the registry source — unused by this plan's single "admin identity" avatar.)

- [ ] **Step 9: DropdownMenu**

Create `work/aliaflow-nextjs/components/ui/dropdown-menu.tsx`:

```tsx
"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
```

(Dropped `DropdownMenuGroup`/`CheckboxItem`/`RadioGroup`/`RadioItem`/`Shortcut`/`Sub*` from the registry source — this plan's one dropdown, the sidebar's user menu, is a single plain item.)

- [ ] **Step 10: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 11: Commit**

```bash
git add hooks/use-mobile.ts components/ui/separator.tsx components/ui/skeleton.tsx components/ui/tooltip.tsx components/ui/sheet.tsx components/ui/sidebar.tsx components/ui/alert-dialog.tsx components/ui/sonner.tsx components/ui/badge.tsx components/ui/avatar.tsx components/ui/dropdown-menu.tsx
git commit -m "Add shadcn Sidebar, AlertDialog, Sonner, Badge, Avatar, and DropdownMenu primitives"
```

---

### Task 4: Move upload storage out of `public/`, fix the extension-spoofing gap

**Files:**
- Create: `work/aliaflow-nextjs/lib/media.ts`
- Create: `work/aliaflow-nextjs/app/uploads/[...path]/route.ts`
- Modify: `work/aliaflow-nextjs/app/api/media/route.ts`
- Modify: `work/aliaflow-nextjs/.gitignore`

**Interfaces:**
- Produces: `UPLOAD_DIR` (absolute path to `storage/uploads/`) and `MIME_EXTENSIONS`/`CONTENT_TYPES` maps from `lib/media.ts`, used by both the upload route (this task) and the serving route (this task) and, in Task 5, by `listUploadedFiles`/`isFileReferenced` (added to the same file there).
- Consumes: nothing new.

This fixes two problems flagged in the prior whole-branch review: (1) Critical — `public/uploads/` is snapshotted by Next.js at build time, so images uploaded after a production build 404 until the server restarts; (2) Important — the upload route trusted the client-supplied filename's extension, which is spoofable (an HTML file typed as `image/png` got saved and served as `.html`, i.e. live HTML from the site's origin).

- [ ] **Step 1: Write the shared upload-storage module**

Create `work/aliaflow-nextjs/lib/media.ts`:

```ts
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
```

- [ ] **Step 2: Rewrite the upload route to use it**

Replace the full contents of `work/aliaflow-nextjs/app/api/media/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, MIME_EXTENSIONS } from "../../../lib/media";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const filename = `${randomUUID()}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ path: `/uploads/${filename}` });
}
```

Note what changed from before: the extension now comes from `MIME_EXTENSIONS[file.type]` (the already-validated MIME type), never from `file.name` — the client's filename is not read at all anymore. `image/svg+xml` is also dropped from the allowed types (SVGs can contain scripts; nothing in this project needs to accept them).

- [ ] **Step 3: Write the serving route**

Create `work/aliaflow-nextjs/app/uploads/[...path]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, CONTENT_TYPES } from "../../../lib/media";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { path: segments } = await params;
  if (segments.some((segment) => segment.includes("..") || segment.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filename = segments.join("/");
  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw error;
  }
}
```

Filenames are always server-generated random UUIDs (from the upload route), so caching them as `immutable` forever is always safe — a given filename's content never changes.

- [ ] **Step 4: Retire `public/uploads/`, gitignore the new directory**

```bash
rm -rf public/uploads
```

Append to `work/aliaflow-nextjs/.gitignore` (replace the whole file so the final content is exactly this):

```
node_modules
.next
.env
prisma/dev.db
prisma/dev.db-journal
storage/uploads
```

- [ ] **Step 5: Manual verification**

```bash
npm run dev &
sleep 3
```

```bash
curl -s -c /tmp/aliaflow-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
```
Expected: `{"ok":true}`

```bash
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test-pixel.png
curl -s -b /tmp/aliaflow-cookies.txt -F "file=@/tmp/test-pixel.png;type=image/png" http://localhost:3000/api/media
```
Expected: `{"path":"/uploads/<uuid>.png"}` — note the `.png` extension regardless of the local file's name.

```bash
ls storage/uploads/
ls public/uploads/ 2>&1
```
Expected: the uploaded file listed under `storage/uploads/`; `public/uploads/` reports "No such file or directory".

```bash
curl -s -o /tmp/downloaded.png -w "%{http_code} %{content_type}\n" http://localhost:3000/uploads/$(ls storage/uploads/)
```
Expected: `200 image/png`.

Spoofed-extension check:
```bash
echo '<script>alert(1)</script>' > /tmp/fake.html
curl -s -b /tmp/aliaflow-cookies.txt -F "file=@/tmp/fake.html;type=image/png;filename=fake.html" http://localhost:3000/api/media
```
Expected: `{"path":"/uploads/<uuid>.png"}` — saved with a `.png` extension (matching the declared MIME type), not `.html`, regardless of the `filename` field.

```bash
kill %1
rm -f /tmp/test-pixel.png /tmp/fake.html /tmp/downloaded.png /tmp/aliaflow-cookies.txt
rm -rf storage/uploads/*
```

- [ ] **Step 6: Commit**

```bash
git add lib/media.ts app/uploads app/api/media/route.ts .gitignore
git commit -m "Move upload storage out of public/ and derive extensions from validated MIME type"
```

---

### Task 5: Media Library backend — listing, reference-checking, and delete

**Files:**
- Modify: `work/aliaflow-nextjs/lib/media.ts`
- Create: `work/aliaflow-nextjs/app/api/media/[filename]/route.ts`

**Interfaces:**
- Consumes: `UPLOAD_DIR` from `lib/media.ts` (Task 4), `prisma` from `lib/db.ts`.
- Produces: `listUploadedFiles(): Promise<{ filename: string; url: string }[]>` and `isFileReferenced(url: string): Promise<string[]>` (returns the list of section keys referencing that URL, empty if unused) — both consumed by Task 9's Media Library page. `DELETE /api/media/[filename]` — consumed by Task 9's delete button.

- [ ] **Step 1: Add the listing/reference-check functions**

Append to `work/aliaflow-nextjs/lib/media.ts` (keep the existing `UPLOAD_DIR`/`MIME_EXTENSIONS`/`CONTENT_TYPES` exports from Task 4, add these below them):

```ts
import { readdir } from "node:fs/promises";
import { prisma } from "./db";

export type UploadedFile = { filename: string; url: string };

export async function listUploadedFiles(): Promise<UploadedFile[]> {
  let entries: string[];
  try {
    entries = await readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((name) => !name.startsWith("."))
    .sort()
    .map((filename) => ({ filename, url: `/uploads/${filename}` }));
}

export async function isFileReferenced(url: string): Promise<string[]> {
  const sections = await prisma.section.findMany();
  return sections.filter((section) => section.data.includes(url)).map((section) => section.key);
}
```

(`lib/media.ts` now needs the `readdir` and `prisma` imports added to the top of the file alongside the existing `path` import.)

- [ ] **Step 2: The delete route**

Create `work/aliaflow-nextjs/app/api/media/[filename]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, isFileReferenced } from "../../../../lib/media";

type RouteContext = { params: Promise<{ filename: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { filename } = await params;
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const usedBy = await isFileReferenced(`/uploads/${filename}`);
  if (usedBy.length > 0) {
    return NextResponse.json(
      { error: `Still used by: ${usedBy.join(", ")}` },
      { status: 409 },
    );
  }

  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
```

This route is already covered by the existing auth middleware — `middleware.ts`'s matcher includes `/api/media/:path*` and its `isProtectedApi` check is `pathname.startsWith("/api/media")` (no method exception, unlike the `/api/sections/` check), so `DELETE` here requires a valid session exactly like the existing `POST` upload route does. No middleware changes needed.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -c /tmp/ck.txt -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
```

Upload a throwaway image, then try deleting an image that IS referenced (the hero background, `/assets/boardroom.png`, is a static asset not in `storage/uploads/`, so instead check a real uploaded-and-referenced case): first PATCH the hero section's image to a freshly uploaded file, confirm delete is blocked, then PATCH it back and confirm delete then succeeds.

```bash
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test-pixel.png
UPLOAD=$(curl -s -b /tmp/ck.txt -F "file=@/tmp/test-pixel.png;type=image/png" http://localhost:3000/api/media)
echo "$UPLOAD"
```

Note the returned path (e.g. `/uploads/abc123.png`), then:

```bash
curl -s -b /tmp/ck.txt http://localhost:3000/api/sections/hero
```

Copy the current hero JSON, PATCH it with the uploaded image swapped in for `image`, e.g. (replace `<uploaded-path>` and keep `eyebrow`/`heading` as returned above):

```bash
curl -s -b /tmp/ck.txt -X PATCH http://localhost:3000/api/sections/hero \
  -H 'Content-Type: application/json' \
  -d '{"eyebrow":"A L I A F L O W","heading":"YOUR TRUSTED\nLEADERSHIP PARTNER","image":"<uploaded-path>"}'
```

```bash
curl -s -b /tmp/ck.txt -X DELETE "http://localhost:3000/api/media/$(basename <uploaded-path>)"
```
Expected: `409` with `{"error":"Still used by: hero"}`.

Revert the hero section back to the original image, then delete again:

```bash
curl -s -b /tmp/ck.txt -X PATCH http://localhost:3000/api/sections/hero \
  -H 'Content-Type: application/json' \
  -d '{"eyebrow":"A L I A F L O W","heading":"YOUR TRUSTED\nLEADERSHIP PARTNER","image":"/assets/boardroom.png"}'
curl -s -b /tmp/ck.txt -X DELETE "http://localhost:3000/api/media/$(basename <uploaded-path>)"
```
Expected: `{"ok":true}` this second time.

```bash
kill %1
rm -f /tmp/test-pixel.png /tmp/ck.txt
```

- [ ] **Step 5: Commit**

```bash
git add lib/media.ts app/api/media/[filename]
git commit -m "Add media listing, reference-checking, and delete endpoint"
```

---

### Task 6: Dashboard/session helper functions

**Files:**
- Modify: `work/aliaflow-nextjs/lib/sections.ts`
- Modify: `work/aliaflow-nextjs/lib/auth.ts`

**Interfaces:**
- Produces: `listSectionsMeta(): Promise<{ key: string; label: string; updatedAt: Date }[]>` (consumed by Task 8's Dashboard page) and `getSessionUserId(): Promise<string | null>` (consumed by Task 7's dashboard layout).
- Consumes: `prisma` (already imported in both files), `sectionSchemas` (already imported in `lib/sections.ts`), `verifySessionToken`/`SESSION_COOKIE_NAME` (already defined in `lib/auth.ts`).

- [ ] **Step 1: Add `listSectionsMeta` to the sections service**

Append to `work/aliaflow-nextjs/lib/sections.ts` (after the existing `updateSection` function, same file — `prisma` and `sectionSchemas` are already imported at the top of this file):

```ts

export async function listSectionsMeta(): Promise<
  { key: string; label: string; updatedAt: Date }[]
> {
  const rows = await prisma.section.findMany({ select: { key: true, updatedAt: true } });
  const updatedAtByKey = new Map(rows.map((row) => [row.key, row.updatedAt]));
  return Object.entries(sectionSchemas).map(([key, schema]) => ({
    key,
    label: schema.label,
    updatedAt: updatedAtByKey.get(key) ?? new Date(0),
  }));
}
```

- [ ] **Step 2: Add `getSessionUserId` to the auth module**

In `work/aliaflow-nextjs/lib/auth.ts`, add `import { cookies } from "next/headers";` to the top of the file (alongside the existing `jose`/`bcryptjs` imports), and append this function at the end of the file:

```ts

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.sub ?? null;
}
```

- [ ] **Step 3: Type-check and re-run the existing test suite**

Run: `npx tsc --noEmit`
Expected: exits 0.

Run: `npm test`
Expected: 11/11 tests still passing (this task doesn't touch anything the existing `auth.test.ts`/`sections.schema.test.ts`/`section-validation.test.ts` suites exercise, but confirms the `lib/auth.ts` edit didn't break the module for non-Next.js contexts — `next/headers`'s `cookies()` is only called inside `getSessionUserId`, never at module load time, so importing the module under vitest is safe).

- [ ] **Step 4: Commit**

```bash
git add lib/sections.ts lib/auth.ts
git commit -m "Add listSectionsMeta and getSessionUserId helpers"
```

---

### Task 7: Sidebar-based admin layout

**Files:**
- Create: `work/aliaflow-nextjs/components/admin/AppSidebar.tsx`
- Modify: `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx`
- Delete: `work/aliaflow-nextjs/components/admin/LogoutButton.tsx` (superseded by the logout item in `AppSidebar`'s user menu)

**Interfaces:**
- Consumes: `Sidebar`/`SidebarContent`/`SidebarFooter`/`SidebarGroup`/`SidebarGroupContent`/`SidebarGroupLabel`/`SidebarHeader`/`SidebarInset`/`SidebarMenu`/`SidebarMenuButton`/`SidebarMenuItem`/`SidebarProvider`/`SidebarTrigger` (Task 3), `Avatar`/`AvatarFallback` (Task 3), `DropdownMenu`/`DropdownMenuContent`/`DropdownMenuItem`/`DropdownMenuTrigger` (Task 3), `Toaster` (Task 3), `sectionSchemas` (existing), `getSessionUserId` (Task 6), `prisma` (existing).
- Produces: `AppSidebar` component (props: `{ adminEmail: string }`), rendered by the layout — no later task consumes it directly, but Task 8/9's pages render inside this layout and inherit the sidebar automatically via Next.js's layout nesting.

- [ ] **Step 1: Delete the superseded LogoutButton**

```bash
rm components/admin/LogoutButton.tsx
```

- [ ] **Step 2: Write the sidebar content component**

Create `work/aliaflow-nextjs/components/admin/AppSidebar.tsx`:

```tsx
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { sectionSchemas } from "@/lib/sections.schema"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/admin/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <p className="px-2 py-1 text-sm font-semibold">Aliaflow CMS</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                  <Link href="/admin">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/media"}>
                  <Link href="/admin/media">Media Library</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(sectionSchemas).map(([key, schema]) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/admin/sections/${key}`}
                  >
                    <Link href={`/admin/sections/${key}`}>{schema.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar size="sm">
                    <AvatarFallback>{adminEmail.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{adminEmail}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
```

- [ ] **Step 3: Rewrite the dashboard layout around the sidebar**

Replace the full contents of `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { AppSidebar } from "@/components/admin/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import "../admin.css";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/admin/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin/login");

  return (
    <SidebarProvider>
      <AppSidebar adminEmail={user.email} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
```

(The middleware from the original build already redirects unauthenticated requests to `/admin/login` before they ever reach this layout — the `redirect()` calls here are a defensive second layer, not the primary auth gate, and let this layout know the concrete admin user to display.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 5: Manual verification**

```bash
npm run dev &
sleep 3
```

Open `http://localhost:3000/admin` in a browser. Confirm: redirected to `/admin/login` if not authenticated; after logging in (admin@aliaflow.com / change-me-please), a left sidebar appears with "Dashboard", "Media Library", and all 12 section labels under a "Sections" heading; clicking a section link navigates there and highlights it as active; the sidebar-toggle button in the header collapses/expands the sidebar; the user menu at the bottom (email + avatar initials) opens a dropdown with "Log out", and clicking it returns you to the login page.

```bash
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/AppSidebar.tsx "app/admin/(dashboard)/layout.tsx"
git rm components/admin/LogoutButton.tsx
git commit -m "Replace the admin nav list with a real shadcn Sidebar"
```

---

### Task 8: Dashboard page

**Files:**
- Modify: `work/aliaflow-nextjs/app/admin/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: `listSectionsMeta` (Task 6), `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardFooter` (Task 2), `Button` (Task 2).

- [ ] **Step 1: Rewrite the dashboard page**

Replace the full contents of `work/aliaflow-nextjs/app/admin/(dashboard)/page.tsx`:

```tsx
import Link from "next/link";
import { listSectionsMeta } from "@/lib/sections";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatRelativeTime(date: Date): string {
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function AdminDashboardPage() {
  const sections = await listSectionsMeta();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Aliaflow CMS</h1>
        <p className="text-muted-foreground">
          Edit any section&apos;s text and images below, or manage uploaded images in the Media Library.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.label}</CardTitle>
              <CardDescription>Last edited {formatRelativeTime(section.updatedAt)}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/sections/${section.key}`}>Edit</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -c /tmp/ck.txt -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
curl -s -b /tmp/ck.txt http://localhost:3000/admin -o /tmp/dashboard.html
grep -c "Edit" /tmp/dashboard.html
grep -o "ago<" /tmp/dashboard.html | wc -l
kill %1
rm -f /tmp/ck.txt /tmp/dashboard.html
```
Expected: both counts are `12` (one "Edit" button and one "... ago" line per section card).

- [ ] **Step 4: Commit**

```bash
git add "app/admin/(dashboard)/page.tsx"
git commit -m "Add a Dashboard landing page showing all sections and their last-edited time"
```

---

### Task 9: Media Library page

**Files:**
- Create: `work/aliaflow-nextjs/components/admin/MediaDeleteButton.tsx`
- Create: `work/aliaflow-nextjs/app/admin/(dashboard)/media/page.tsx`

**Interfaces:**
- Consumes: `listUploadedFiles`/`isFileReferenced` (Task 5), `Card`/`CardContent`/`CardFooter` (Task 2), `Badge` (Task 3), `AlertDialog*` (Task 3), `Button` (Task 2), `DELETE /api/media/[filename]` (Task 5).

- [ ] **Step 1: The delete button (client component)**

Create `work/aliaflow-nextjs/components/admin/MediaDeleteButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MediaDeleteButton({ filename }: { filename: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/media/${filename}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Delete failed");
      toast.success("Image deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={deleting}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this image?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes {filename} from the server. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: The Media Library page (server component)**

Create `work/aliaflow-nextjs/app/admin/(dashboard)/media/page.tsx`:

```tsx
import { listUploadedFiles, isFileReferenced } from "@/lib/media";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaDeleteButton } from "@/components/admin/MediaDeleteButton";

export default async function MediaLibraryPage() {
  const files = await listUploadedFiles();
  const usage = await Promise.all(files.map((file) => isFileReferenced(file.url)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="text-muted-foreground">
          {files.length} uploaded image{files.length === 1 ? "" : "s"}.
        </p>
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file, index) => {
            const usedBy = usage[index];
            return (
              <Card key={file.filename} className="overflow-hidden py-0">
                <CardContent className="p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt="" className="aspect-square w-full object-cover" />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 py-4">
                  <p className="w-full truncate text-xs text-muted-foreground">{file.filename}</p>
                  {usedBy.length > 0 ? (
                    <Badge variant="secondary">
                      Used by {usedBy.length} section{usedBy.length === 1 ? "" : "s"}
                    </Badge>
                  ) : (
                    <MediaDeleteButton filename={file.filename} />
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Manual verification**

```bash
npm run dev &
sleep 3
```

Open `http://localhost:3000/admin/media` after logging in. With no uploads yet, confirm it shows "No images uploaded yet." Then, from any section editor, upload an image on an image field (don't save the section yet) — go back to Media Library and confirm the new file appears in the grid with a working "Delete" button (it's not referenced by any section's *saved* data yet). Save that section with the new image, reload Media Library, and confirm the same file now shows a "Used by 1 section" badge instead of a delete button. Click "Delete" on a genuinely unused image, confirm the AlertDialog appears, confirm, and confirm the grid updates (file gone) after the toast.

```bash
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add components/admin/MediaDeleteButton.tsx "app/admin/(dashboard)/media/page.tsx"
git commit -m "Add the Media Library page"
```

---

### Task 10: End-to-end verification and README update

**Files:**
- Modify: `work/aliaflow-nextjs/README.md`

**Interfaces:**
- Consumes: nothing new — this task proves the whole branch works together, especially under a real production build (the scenario the original Critical bug only showed up in).

- [ ] **Step 1: Full type-check, test suite, and production build**

```bash
npx tsc --noEmit
```
Expected: exits 0.

```bash
npm test
```
Expected: 11/11 tests passing (unchanged from before this plan — nothing in this plan touches the validator/schema/auth test suites' subject matter beyond the additive `getSessionUserId` function, already covered in Task 6).

```bash
rm -rf .next
npm run build
```
Expected: succeeds; `/` and every `/admin/*` route (including the new `/admin/media`) listed in the output.

- [ ] **Step 2: Production-mode proof that uploaded images survive a restart**

This is the direct verification of the bug this plan fixes.

```bash
npm run start &
sleep 3
```

```bash
curl -s -c /tmp/ck.txt -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test-pixel.png
UPLOAD_PATH=$(curl -s -b /tmp/ck.txt -F "file=@/tmp/test-pixel.png;type=image/png" http://localhost:3000/api/media | python3 -c "import json,sys; print(json.load(sys.stdin)['path'])")
echo "uploaded: $UPLOAD_PATH"
curl -s -o /dev/null -w "before restart: %{http_code}\n" "http://localhost:3000${UPLOAD_PATH}"
kill %1
```

```bash
npm run start &
sleep 3
curl -s -o /dev/null -w "after restart: %{http_code}\n" "http://localhost:3000${UPLOAD_PATH}"
kill %1
```

Expected: `before restart: 200` and, critically, `after restart: 200` too (this is exactly the scenario that 404ed before this plan — `public/uploads/` would have been wiped/frozen at the build snapshot; `storage/uploads/` is untouched by the build and persists across restarts).

Clean up:
```bash
rm -f /tmp/test-pixel.png /tmp/ck.txt
rm -rf storage/uploads/*
```

- [ ] **Step 3: Full manual click-through**

```bash
npm run dev &
sleep 3
```

In a browser: log in, confirm the Dashboard shows all 12 sections with plausible "last edited" times; click into 2-3 different sections and confirm the shadcn-styled form still edits and saves correctly (text, textarea, image upload, and at least one list add/remove); visit Media Library and confirm the grid, badges, and delete flow all work; confirm the sidebar collapses/expands and the user-menu logout works; confirm the public site at `/` still renders exactly as before (no visual regression — Tailwind's admin-only scoping must still hold).

```bash
kill %1
```

- [ ] **Step 4: Update the README**

In `work/aliaflow-nextjs/README.md`, replace the "Content model" section's closing paragraph and the line after "Admin panel:" with this expanded description (keep everything else in the file as-is):

```md
Admin panel: `http://localhost:3000/admin` (log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`) — a Dashboard shows every section with its last-edited time, a Media Library at `/admin/media` lists every uploaded image and lets you delete ones no longer referenced by any section, and the sidebar lists every editable section.

Uploaded images are stored under `storage/uploads/` (not `public/`, which Next.js
snapshots at build time) and served through `app/uploads/[...path]/route.ts` — on
a real deployment, `storage/uploads/` needs the same persistent-volume treatment
`prisma/dev.db` does (see the deployment note below).
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Update README for the Dashboard, Media Library, and upload storage change"
```

## Post-plan note

`storage/uploads/` needs the same persistent-volume treatment as `prisma/dev.db`
on the target Arvan Cloud VPS deployment (mount it on a path that survives
redeploys — a build step must never wipe it).
