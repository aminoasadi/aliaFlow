import type { ReactNode } from "react";

export function PageHeader({ kicker, title, description, actions }: { kicker: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="admin-page-header"><div><p className="admin-kicker">{kicker}</p><h1 className="admin-title">{title}</h1>{description ? <p className="admin-description">{description}</p> : null}</div>{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}</header>;
}
