import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export default async function resetDatabase() {
    await client.contact.deleteMany();
}