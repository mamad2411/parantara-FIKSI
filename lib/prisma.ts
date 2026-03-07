// Prisma client with fallback for build time
let PrismaClient: any

try {
  // Try to import PrismaClient
  const prismaModule = require('@prisma/client')
  PrismaClient = prismaModule.PrismaClient
} catch (error) {
  // Fallback for build time when Prisma client is not generated yet
  console.warn('Prisma Client not available, using mock')
  PrismaClient = class MockPrismaClient {
    masjidRegistration = {
      create: async () => ({ id: 'mock-id' }),
      findUnique: async () => null,
      findMany: async () => []
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
