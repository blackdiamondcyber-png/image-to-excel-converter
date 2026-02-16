"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Scan",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#4F8EF7" : "#5A6178"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#4F8EF7" : "#5A6178"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 safe-area-bottom">
      {/* Glass background */}
      <div className="bg-snap-surface/90 backdrop-blur-xl border-t border-snap-border/60">
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
                className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 min-h-[60px] justify-center no-underline transition-all duration-200 active:scale-95 relative ${
                  isActive ? "text-snap-accent" : "text-snap-text-dim"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-b-full bg-snap-accent shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
                )}
                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {item.icon(isActive)}
                </div>
                <span
                  className={`text-[11px] transition-colors duration-200 ${
                    isActive
                      ? "font-semibold text-snap-accent"
                      : "font-medium text-snap-text-dim"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
