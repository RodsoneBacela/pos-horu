import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id       as string;
        token.username = (user as any).username as string;
        token.role     = (user as any).role     as string;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id       = token.id       as string;
        session.user.username = token.username as string;
        session.user.role     = token.role     as any;
      }
      return session;
    },
  },
};