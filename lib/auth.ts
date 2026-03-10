import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "./validations/auth.schema";


export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, 
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email ou Username", type: "text" },
        password:   { label: "Password",          type: "password" },
      },

      async authorize(credentials) {
        // 1. Validar com Zod
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { identifier, password } = validated.data;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email:    identifier.toLowerCase() },
              { username: identifier.toLowerCase() },
            ],
            activo: true,
          },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id:       user.id,
          email:    user.email,
          name:     user.nome,
          username: user.username,
          role:     user.role,
        };
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id       = user.id as string;
      token.username = (user as any).username as string;
      token.role     = (user as any).role;
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
});