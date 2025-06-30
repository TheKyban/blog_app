import { SignJWT, jwtVerify } from "jose";
import { ROLE } from "./generated/prisma";
import { Prisma } from "@/prisma/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthUser {
  id: string;
  username: string;
  role: ROLE;
}

export async function authenticate(
  username: string,
  password: string
): Promise<AuthUser | null> {
  // const user = ADMIN_USERS.find((u) => u.username === username);
  const user = await Prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    return null;
  }

  if (password !== user.password) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      id: payload.sub as string,
      username: payload.username as string,
      role: payload.role as ROLE,
    };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
}
