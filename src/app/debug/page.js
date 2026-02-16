"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function DebugPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      // Wait for auth to be ready
      await new Promise((resolve) => {
        const unsub = auth?.onAuthStateChanged((user) => {
          unsub();
          resolve(user);
        });
        if (!auth) resolve(null);
      });

      const user = auth?.currentUser;
      if (!user) {
        setResult({ error: "No user signed in", authNull: !auth });
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken(true); // Force refresh
        const res = await fetch("/api/debug-auth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ error: err.message });
      }
      setLoading(false);
    }
    test();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "monospace", fontSize: 12, color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1>Auth Debug</h1>
      {loading ? <p>Testing auth...</p> : <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
