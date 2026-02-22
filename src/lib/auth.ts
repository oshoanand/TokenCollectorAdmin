import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      } as const,

      async authorize(credentials) {
        try {
          // 1. Validate credentials
          if (!credentials?.mobile || !credentials?.password) {
            throw new Error("Mobile and Password are required");
          }

          // 2. Find user in database
          const user = await prisma.user.findUnique({
            where: {
              mobile: credentials.mobile,
              userRole: "ADMINISTRATOR",
            },
          });

          // 3. Verify user exists
          if (!user || !user.password) {
            throw new Error("user or password is incorrect !");
          }

          // 4. Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Password is wrong !");
          }

          const secret = process.env.NEXTAUTH_SECRET!;
          const token = jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
              iat: Date.now() / 1000,
              exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            },
            secret,
            {
              algorithm: "HS256",
            },
          );
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            image: user.image,
            role: user.userRole,
            accessToken: token,
          };
        } catch (error: any) {
          throw new Error(error.message);
        } finally {
          async () => {
            await prisma.$disconnect();
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image ? user.image.toString() : "";
        token.name = user.name ? user.name.toString() : "";
        token.email = user.email ? user.email.toString() : "";
        token.accessToken = user.accessToken;
        token.role = user.role ? user.role.toString() : "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Using `token.sub || token.id` ensures the ID is NEVER lost.
        (session.user as any).id = (token.sub || token.id) as string;
        (session.user as any).image = token.image as string;
        (session.user as any).name = token.name as string;
        (session.user as any).email = token.email as string;
        (session.user as any).role = token.role as string;
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom sign-in page path
  },
  secret: process.env.NEXTAUTH_SECRET,
};
