"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScans } from "@/hooks/useScans";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ScanCard from "./ScanCard";
import EmptyState from "./EmptyState";
import { SkeletonList } from "./Skeleton";
import ReviewStep from "./ReviewStep";
import ExportStep from "./ExportStep";
import Link from "next/link";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { scans, loading, deleteScan } = useScans();
  const toast = useToast();
  const router = useRouter();
  const [viewingScan, setViewingScan] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "review" | "export"
  const [viewTables, setViewTables] = useState([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  const handleView = (scan) => {
    if (!scan.tables_json || scan.tables_json.length === 0) {
      toast.warning("No table data found in this scan");
      return;
    }
    setViewingScan(scan);
    setViewTables(
      typeof scan.tables_json === "string"
        ? JSON.parse(scan.tables_json)
        : scan.tables_json
    );
    setViewMode("review");
  };

  const handleDelete = async (id) => {
    try {
      await deleteScan(id);
      toast.success("Scan deleted");
    } catch {
      toast.error("Failed to delete scan");
    }
  };

  const handleBack = () => {
    setViewingScan(null);
    setViewMode(null);
    setViewTables([]);
  };

  // Viewing a saved scan's data
  if (viewMode === "review") {
    return (
      <div className="bg-snap-bg min-h-screen min-h-[100dvh] max-w-[500px] mx-auto font-sans flex flex-col relative pb-[72px]">
        <Header step="review" onReset={handleBack} />
        <ReviewStep
          tables={viewTables}
          setTables={setViewTables}
          onExport={() => setViewMode("export")}
          onBack={handleBack}
        />
        <BottomNav />
      </div>
    );
  }

  if (viewMode === "export") {
    return (
      <div className="bg-snap-bg min-h-screen min-h-[100dvh] max-w-[500px] mx-auto font-sans flex flex-col relative pb-[72px]">
        <Header step="export" onReset={handleBack} />
        <ExportStep tables={viewTables} onReset={handleBack} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-snap-bg min-h-screen min-h-[100dvh] max-w-[500px] mx-auto font-sans flex flex-col relative pb-[72px]">
      <Header step="capture" onReset={() => router.push("/")} />

      <div className="px-4 sm:px-5 py-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-snap-text text-lg font-bold">Scan History</h2>
          {scans.length > 0 && (
            <span className="text-snap-text-dim text-[11px]">
              {scans.length} scan{scans.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Not logged in */}
        {!authLoading && !user && (
          <EmptyState
            icon="🔐"
            title="Sign in to see history"
            description="Your scan history is saved to your account. Sign in or create an account to get started."
            action={
              <Link
                href="/login"
                className="inline-block px-6 py-3.5 rounded-xl bg-gradient-to-br from-snap-accent to-purple-600 text-white text-sm font-semibold no-underline hover:opacity-90 active:opacity-80 transition-opacity min-h-[48px]"
              >
                Sign In
              </Link>
            }
          />
        )}

        {/* Loading */}
        {(loading || authLoading) && user && <SkeletonList count={3} />}

        {/* Empty state */}
        {!loading && user && scans.length === 0 && (
          <EmptyState
            icon="📷"
            title="No scans yet"
            description="Capture your first document and it will appear here for easy access later."
            action={
              <Link
                href="/"
                className="inline-block px-6 py-3.5 rounded-xl bg-gradient-to-br from-snap-accent to-purple-600 text-white text-sm font-semibold no-underline hover:opacity-90 active:opacity-80 transition-opacity min-h-[48px]"
              >
                Start Scanning
              </Link>
            }
          />
        )}

        {/* Scan list */}
        {!loading && scans.length > 0 && (
          <div className="space-y-3">
            {scans.map((scan) => (
              <ScanCard
                key={scan.id}
                scan={scan}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
