import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = new TextEncoder().encode(secret);

export interface SessionPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export async function createSession(
  payload: SessionPayload
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();

  cookieStore.set("primeway_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("primeway_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      JWT_SECRET
    );

    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "USER" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete("primeway_session");
}