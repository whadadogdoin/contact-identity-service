import { Contact, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const client = new PrismaClient();

export async function identify(req: Request, res: Response) {
    const { email, phoneNumber } = req.body;
    const parsedemail = email || undefined
    const parsedphoneNumber = phoneNumber || undefined;
    console.log("Received identify request with data:", req.body);
    try {

        const visited = new Set<Number>();
        const linkedContacts: Contact[] = [];
        const visitedContacts: Contact[] = [];
        
        const matches = await client.contact.findMany({
            where: {
                OR: [
                { email: parsedemail || undefined },
                { phoneNumber: parsedphoneNumber || undefined }
                ].filter(Boolean)
            }
        });

        if (matches.length === 0) {
            const newContact = await client.contact.create({
                data: {
                    email: parsedemail || undefined,
                    phoneNumber: parsedphoneNumber || undefined,
                    linkPrecedence: 'primary',
                }
            })
            res.status(200).json({
                "contact": {
                    "primaryContactId": newContact.id,
                    "emails": [newContact.email],
                    "phoneNumbers": [newContact.phoneNumber],
                    "secondaryContactIds": []
                }
            })
            return;
        }

        linkedContacts.push(...matches);
        visitedContacts.push(...matches);
        while(visitedContacts.length > 0) {
            const currentContact = visitedContacts.pop();
            if (!currentContact || visited.has(currentContact.id)) continue;
            visited.add(currentContact.id);

            if (currentContact.linkedId && !visited.has(currentContact.linkedId)) {
                const parent = await client.contact.findUnique({
                    where: { id: currentContact.linkedId }
                });
                if (parent) {
                    linkedContacts.push(parent);
                    visitedContacts.push(parent);
                }
            }

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
                    visitedContacts.push(c);
                }
            }
        }

        const existingemail = parsedemail && linkedContacts.some(c => c.email === parsedemail);
        const existingPhoneNumber = parsedphoneNumber && linkedContacts.some(c => c.phoneNumber === parsedphoneNumber);

        // console.log("Existing email:", existingemail);
        // console.log("Existing phone number:", existingPhoneNumber);
        

        if((!existingemail && existingemail!==undefined) || (!existingPhoneNumber && existingPhoneNumber!==undefined)) {
            const newContact = await client.contact.create({
                data: {
                    email: parsedemail ||  undefined,
                    phoneNumber: parsedphoneNumber || undefined,
                    linkPrecedence: 'secondary',
                }
            });
            linkedContacts.push(newContact);
        }

        const uniqueContacts = Array.from(
            new Map(linkedContacts.map(c => [c.id, c])).values()
        );

        const sortedContacts = uniqueContacts.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const primaryContact = sortedContacts[0];

        const secondaryContactIds = sortedContacts.filter(c => c.id !== primaryContact.id).map(c => c.id);
        await client.contact.updateMany({
            where: {
                id: {
                    in: secondaryContactIds
                }
            },
            data: {
                linkPrecedence: 'secondary',
                linkedId : primaryContact.id
            }
        })

        await client.contact.update({
            where: { id: primaryContact.id },
            data: {
                linkPrecedence: 'primary',
                linkedId: null
            }
        });

        const emails = [...new Set(sortedContacts.map(c => c.email).filter(Boolean))];
        const phoneNumbers = [...new Set(sortedContacts.map(c => c.phoneNumber).filter(Boolean))];

        res.status(200).json({
            "contact": {
                "primaryContactId": primaryContact.id,
                "emails": emails,
                "phoneNumbers": phoneNumbers,
                "secondaryContactIds": secondaryContactIds
            }
        });
    } catch (error) {
        console.error("Error processing identify request:", error);
        res.status(500).json({
            message: "An error occurred while processing the request",
            error
        })
    }
}