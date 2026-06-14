import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ShellHeader } from "./ShellHeader";

export function AppShell() {
  const { pathname } = useLocation();
  const isWritePage = pathname === "/write";

  return (
    <div className="min-h-dvh overflow-x-hidden bg-surface pb-[100px] text-on-surface">
      {!isWritePage && <ShellHeader />}
      <div className={isWritePage ? undefined : "shell-content"}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
