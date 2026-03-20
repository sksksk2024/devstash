import GitHub from "@auth/core/providers/github";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
};
