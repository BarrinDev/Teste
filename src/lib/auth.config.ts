import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by middleware: no Prisma/bcrypt here, only the
// providers array is filled in by the full config in `auth.ts`.
export default {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
