"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

/**
 * Auth hook — returns current user and auth helpers.
 * Gracefully handles missing Firebase config (app works without auth).
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signUp = async (email, password, displayName) => {
    if (!auth) throw new Error("Firebase not configured");
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(newUser, { displayName });
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (!auth) return;
    return firebaseSignOut(auth);
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error("Firebase not configured");
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  return { user, loading, signIn, signUp, signOut, resetPassword };
}
