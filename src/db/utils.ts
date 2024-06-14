import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function createUser(discordName: string, minecraftName: string, token: string, id: string): Promise<void> {
  await prisma.user.create({
    data: {
      discordName,
      minecraftName,
      token,
      id
    },
  });
}

export async function getUserByDiscordId(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}
