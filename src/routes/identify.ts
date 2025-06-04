import { Contact, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const client = new PrismaClient();

export async function identify(req: Request, res: Response) {
    const { email, phoneNumber } = req.body;
    try {

        const visited = new Set<Number>();
        const linkedContacts: Contact[] = [];
        
        const matches = await client.contact.findMany({
            where: {
                OR: [
                    email ? email : null,
                    phoneNumber ? phoneNumber : null
                ].filter(Boolean)
            }
        });

        if (matches.length === 0) {
            const newContact = await client.contact.create({
                data: {
                    email: email || undefined,
                    phoneNumber: phoneNumber || undefined,
                    linkPrecedence: 'primary',
                }
            })
            return res.status(200).json({
                "contact": {
                    "primaryContactId": newContact.id,
                    "emails": [newContact.email],
                    "phoneNumbers": [newContact.phoneNumber],
                    "secondaryContactIds": []
                }
            })
        }

        linkedContacts.push(...matches);
        while(linkedContacts.length > 0) {
            const currentContact = linkedContacts.pop();
            if (!currentContact || visited.has(currentContact.id)) continue;
            visited.add(currentContact.id);

            const relatedContacts = await client.contact.findMany({
                where: {
                    OR: [
                        { email: currentContact.email },
                        { phoneNumber: currentContact.phoneNumber }
                    ].filter(Boolean)
                }
            });

            for (const c of relatedContacts) {
                if (!visited.has(c.id)) {
                    linkedContacts.push(c);
                }
            }
        }

        const sortedContacts = linkedContacts.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const primaryContact = sortedContacts[0];

    } catch (error) {
        
    }
}