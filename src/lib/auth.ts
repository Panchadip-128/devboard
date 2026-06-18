import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;

        // Fetch the user's role from TeamMember mapping for RBAC
        const teamMember = await prisma.teamMember.findFirst({
          where: { userId: user.id },
          select: { role: true, teamId: true }
        });
        
        // @ts-ignore
        session.user.role = teamMember?.role || 'VIEWER';
        // @ts-ignore
        session.user.teamId = teamMember?.teamId || null;
      }
      return session;
    },
  },
};
