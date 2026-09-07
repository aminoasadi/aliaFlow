"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={handleLogout}>
      Log out
    </Button>
  );
}
