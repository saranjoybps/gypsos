"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type Portal = "vendor" | "admin";

/**
 * The vendor and admin portals use two separate Firebase apps, so each keeps its own signed-in session.
 * Otherwise signing in as admin in one tab would replace (or sign out) the vendor session in another.
 */
const appFor = (name: Portal) => getApps().find((a) => a.name === name) ?? initializeApp(config, name);
export const authFor = (portal: Portal) => getAuth(appFor(portal));
export const portalOf = (path: string): Portal => (path.startsWith("/admin") || path.startsWith("/api/admin") ? "admin" : "vendor");

/** Current Firebase user for a portal; `ready` is false until Firebase has restored the session. */
export function useFirebaseUser(portal: Portal) {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  useEffect(() => onAuthStateChanged(authFor(portal), (user) => setState({ user, ready: true })), [portal]);
  return state;
}

export class ApiFail extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Calls an /api route with the signed-in user's ID token. */
export async function api<T = Record<string, never>>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = authFor(portalOf(path));
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as ({ ok: boolean; error?: string; fields?: Record<string, string> } & T) | null;
  if (!res.ok || !json?.ok) throw new ApiFail(json?.error ?? "Something went wrong. Please try again.", res.status, json?.fields);
  return json;
}

/** GET helper with loading / error / reload. Pass null to skip. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string }>({ path: null, data: null, error: "" });

  const run = useCallback(async (p: string) => {
    try {
      return { path: p, data: await api<T>(p), error: "" };
    } catch (e) {
      return { path: p, data: null, error: e instanceof Error ? e.message : "Could not load." };
    }
  }, []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    void run(path).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [path, run]);

  const reload = useCallback(async () => {
    if (path) setState(await run(path));
  }, [path, run]);

  const current = state.path === path;
  return { data: current ? state.data : null, error: current ? state.error : "", loading: Boolean(path) && !current, reload };
}

export const friendlyAuthError = (code: string | undefined) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    default:
      return "Could not sign in. Please try again.";
  }
};
