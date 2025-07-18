import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"

// Use direct export pattern for App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }