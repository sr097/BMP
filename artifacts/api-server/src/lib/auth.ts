import * as client from "openid-client";
import crypto from "crypto";
import { type Request, type Response } from "express";
import { db, sessionsTable, dbAvailable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthUser } from "@workspace/api-zod";

export const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";
export const SESSION_COOKIE = "sid";
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export interface SessionData {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

let oidcConfig: client.Configuration | null = null;

// In-memory session store for development without database
const inMemorySessions = new Map<string, { data: SessionData; expires: Date }>();

export async function getOidcConfig(): Promise<client.Configuration> {
  if (!oidcConfig) {
    oidcConfig = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!,
    );
  }
  return oidcConfig;
}

export async function createSession(data: SessionData): Promise<string> {
  const sid = crypto.randomBytes(32).toString("hex");
  
  if (dbAvailable && db) {
    try {
      await db.insert(sessionsTable).values({
        sid,
        sess: data as unknown as Record<string, unknown>,
        expire: new Date(Date.now() + SESSION_TTL),
      });
    } catch (err) {
      console.warn("Database insert failed, using in-memory fallback:", err);
      inMemorySessions.set(sid, {
        data,
        expires: new Date(Date.now() + SESSION_TTL),
      });
    }
  } else {
    // Use in-memory storage
    inMemorySessions.set(sid, {
      data,
      expires: new Date(Date.now() + SESSION_TTL),
    });
  }
  
  return sid;
}

export async function getSession(sid: string): Promise<SessionData | null> {
  if (dbAvailable && db) {
    try {
      const [row] = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.sid, sid));

      if (!row || row.expire < new Date()) {
        if (row) await deleteSession(sid);
        return null;
      }

      return row.sess as unknown as SessionData;
    } catch (err) {
      console.warn("Database query failed, checking in-memory fallback:", err);
      // Fall through to in-memory check
    }
  }
  
  // Use in-memory storage
  const session = inMemorySessions.get(sid);
  if (!session || session.expires < new Date()) {
    if (session) await deleteSession(sid);
    return null;
  }
  return session.data;
}

export async function updateSession(
  sid: string,
  data: SessionData,
): Promise<void> {
  if (dbAvailable && db) {
    try {
      await db
        .update(sessionsTable)
        .set({
          sess: data as unknown as Record<string, unknown>,
          expire: new Date(Date.now() + SESSION_TTL),
        })
        .where(eq(sessionsTable.sid, sid));
    } catch (err) {
      console.warn("Database update failed, using in-memory fallback:", err);
      // Fall through to in-memory update
    }
  }
  
  // Use in-memory storage
  const session = inMemorySessions.get(sid);
  if (session) {
    session.data = data;
    session.expires = new Date(Date.now() + SESSION_TTL);
  }
}

export async function deleteSession(sid: string): Promise<void> {
  if (dbAvailable && db) {
    try {
      await db.delete(sessionsTable).where(eq(sessionsTable.sid, sid));
    } catch (err) {
      console.warn("Database delete failed, using in-memory fallback:", err);
      // Fall through to in-memory delete
    }
  }
  
  // Use in-memory storage
  inMemorySessions.delete(sid);
}

export async function clearSession(
  res: Response,
  sid?: string,
): Promise<void> {
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}
