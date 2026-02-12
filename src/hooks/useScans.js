"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Hook for managing saved scans in Firestore.
 * Gracefully returns empty state if Firebase is not configured.
 */
export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(async () => {
    if (!db || !auth?.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "scans"),
        where("user_id", "==", auth.currentUser.uid),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setScans(data);
    } catch (err) {
      console.error("Error fetching scans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const saveScan = useCallback(async (scanData) => {
    if (!db) return null;

    const docRef = await addDoc(collection(db, "scans"), {
      ...scanData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const saved = { id: docRef.id, ...scanData, created_at: new Date().toISOString() };
    setScans((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const deleteScan = useCallback(async (id) => {
    if (!db) return;

    await deleteDoc(doc(db, "scans", id));
    setScans((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { scans, loading, fetchScans, saveScan, deleteScan };
}
