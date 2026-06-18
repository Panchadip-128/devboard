import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Validates if the current user has the required role.
 * If validation fails, it returns a 403 NextResponse that should be returned by the API route.
 * If successful, it returns the authenticated user object.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // @ts-ignore
  const userRole = (session.user?.role as Role) || 'VIEWER';

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] but got ${userRole}` },
      { status: 403 }
    );
  }
  
  // @ts-ignore
  return session.user;
}
