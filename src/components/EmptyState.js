"use client";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="text-5xl mb-4 opacity-60">{icon || "📭"}</div>
      <h3 className="text-snap-text text-base font-semibold mb-1.5">
        {title || "Nothing here yet"}
      </h3>
      <p className="text-snap-text-muted text-xs max-w-[260px] mb-6">
        {description || "Get started by creating your first item"}
      </p>
      {action}
    </div>
  );
}
