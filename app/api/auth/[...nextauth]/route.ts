import { JWT } from "next-auth/jwt"
import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.id && !credentials?.email) {
            return null
          }

          // Connect to the database
          await connectToDatabase()

          // Use either email or id to look up the student in database
          const db = mongoose.connection.db
          
          // Build query based on available credentials
          const query: any = {}
          if (credentials.email) {
            query.email = credentials.email
          } else if (credentials.id) {
            // Try to convert to ObjectId if it looks like a valid MongoDB ID
            try {
              if (/^[0-9a-fA-F]{24}$/.test(credentials.id)) {
                query._id = new mongoose.Types.ObjectId(credentials.id)
              } else {
                query.studentId = credentials.id
              }
            } catch (err) {
              query.studentId = credentials.id
            }
          }

          // Look up student
          if (!db) {
            throw new Error("Database connection not established")
          }
          
          const student = await db.collection("students").findOne(query)
          
          if (!student) {
            console.log("Student not found:", query)
            return null
          }

          // Verify password (very basic for now, you might want to use bcrypt)
          if (student.password !== credentials.password) {
            console.log("Password mismatch")
            return null
          }

          // Return user object that will be stored in the JWT token
          return {
            id: student._id.toString(),
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            role: "student"
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any, token: JWT }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Use a hardcoded secret for now - in production, use environment variables
  secret: "ThisIsASecretKeyThatShouldBeChangedInProduction"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 