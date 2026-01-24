import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Update path to where you created auth.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
