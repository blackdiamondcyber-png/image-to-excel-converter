"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Scan", icon: "📸" },
  { href: "/history", label: "History", icon: "📋" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-snap-surface/95 backdrop-blur-sm border-t border-snap-border z-50 safe-area-bottom">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 min-h-[56px] justify-center no-underline transition-colors active:opacity-70 ${
                isActive ? "text-snap-accent" : "text-snap-text-dim"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
