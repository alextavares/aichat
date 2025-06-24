import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AzureADProvider from "next-auth/providers/azure-ad"
import AppleProvider from "next-auth/providers/apple"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const providers = []

// Only add OAuth providers if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here") {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET &&
    process.env.GITHUB_ID !== "your-github-client-id") {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }))
}

// Microsoft/Azure AD provider
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && 
    process.env.AZURE_AD_TENANT_ID) {
  providers.push(AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
  }))
}

// Apple provider
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(AppleProvider({
    clientId: process.env.APPLE_ID,
    clientSecret: process.env.APPLE_SECRET,
  }))
}

// Always include credentials provider
providers.push(CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateSessionData }) { // Adicionado trigger e session para updates
      // Quando o usuário faz login (objeto `user` está presente)
      if (user?.id) {
        token.id = user.id;
        // Buscar dados adicionais do usuário no login inicial
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { onboardingCompleted: true, planType: true } // Adicionando planType também, para o próximo passo do plano
        });
        if (dbUser) {
          token.onboardingCompleted = dbUser.onboardingCompleted;
          token.planType = dbUser.planType;
        }
      }

      // Se o trigger for um update (ex: useSession().update())
      if (trigger === "update" && updateSessionData) {
        // Aqui podemos atualizar o token com novos dados, se necessário.
        // Por exemplo, se o onboarding foi completado e a sessão foi atualizada.
        // A página de onboarding (`app/onboarding/page.tsx`) já chama `update()`
        // após o onboarding. Precisamos garantir que os novos dados sejam refletidos.

        // Refetch user data to ensure token has the latest info
        if (token.id) {
            const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                select: { onboardingCompleted: true, planType: true }
            });
            if (dbUser) {
                token.onboardingCompleted = dbUser.onboardingCompleted;
                token.planType = dbUser.planType; // Atualiza o planType também
            }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.onboardingCompleted = token.onboardingCompleted as boolean | undefined;
        // @ts-ignore
        session.user.planType = token.planType as string | undefined; // Adicionando planType também
      }
      return session;
    }
  }
}