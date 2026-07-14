import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001/api/auth",
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
