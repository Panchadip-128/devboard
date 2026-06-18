import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Centralized Role-Based Access Control (RBAC) Middleware.
 * 
 * This utility enforces strict authorization across our API endpoints.
 * It intercepts the NextAuth JSON Web Token (which contains the user's database-mapped `Role`)
 * and validates it against the endpoint's allowed roles. 
 * 
 * By checking the cryptographically signed JWT rather than querying the database 
 * on every request, we prevent privilege escalation while maintaining high Edge network throughput.
 *
 * @param allowedRoles - An array of `Role` enums permitted to execute the calling function.
 * @returns {Promise<NextResponse | User>} A 403/401 Next.js Response if unauthorized, or the User object if successful.
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
