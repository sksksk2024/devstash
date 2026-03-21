import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import Credentials from "@auth/core/providers/credentials";

// Determine if email verification is enabled
const isEmailVerificationEnabled =
  process.env.ENABLE_EMAIL_VERIFICATION !== "false";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    ...authConfig.providers.filter((p) => p.name !== "credentials"),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!existingUser) {
          throw new Error("No user found with this email");
        }

        if (!existingUser.password) {
          throw new Error(
            "This user signed up via OAuth and cannot use password sign-in",
          );
        }

        // Check if email is verified (only if verification is enabled)
        if (isEmailVerificationEnabled && !existingUser.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          existingUser.password,
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return existingUser;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.BETTER_AUTH_SECRET,
});
