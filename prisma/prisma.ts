import { PrismaClient } from "@/lib/generated/prisma";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const Prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = Prisma;
