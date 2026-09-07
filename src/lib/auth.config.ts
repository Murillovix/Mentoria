import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config (no bcrypt/Prisma here) so it can be shared by the
// middleware, which runs on the Edge runtime. The Credentials provider
// (which needs Node APIs) is added on top of this in `auth.ts`.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isPortal = nextUrl.pathname.startsWith("/portal");

      if (isDashboard) {
        if (!isLoggedIn) return false;
        if (role !== "PROFESSIONAL") {
          return Response.redirect(new URL("/portal", nextUrl));
        }
        return true;
      }

      if (isPortal) {
        if (!isLoggedIn) return false;
        if (role !== "STUDENT") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
