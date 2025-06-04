"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identify = identify;
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
function identify(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, phoneNumber } = req.body;
        const parsedemail = email || undefined;
        const parsedphoneNumber = phoneNumber || undefined;
        console.log("Received identify request with data:", req.body);
        try {
            const visited = new Set();
            const linkedContacts = [];
            const visitedContacts = [];
            const matches = yield client.contact.findMany({
                where: {
                    OR: [
                        { email: parsedemail || undefined },
                        { phoneNumber: parsedphoneNumber || undefined }
                    ].filter(Boolean)
                }
            });
            if (matches.length === 0) {
                const newContact = yield client.contact.create({
                    data: {
                        email: parsedemail || undefined,
                        phoneNumber: parsedphoneNumber || undefined,
                        linkPrecedence: 'primary',
                    }
                });
                res.status(200).json({
                    "contact": {
                        "primaryContactId": newContact.id,
                        "emails": [newContact.email],
                        "phoneNumbers": [newContact.phoneNumber],
                        "secondaryContactIds": []
                    }
                });
                return;
            }
            linkedContacts.push(...matches);
            visitedContacts.push(...matches);
            while (visitedContacts.length > 0) {
                const currentContact = visitedContacts.pop();
                if (!currentContact || visited.has(currentContact.id))
                    continue;
                visited.add(currentContact.id);
                const relatedContacts = yield client.contact.findMany({
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
            if ((!existingemail && existingemail !== undefined) || (!existingPhoneNumber && existingPhoneNumber !== undefined)) {
                const newContact = yield client.contact.create({
                    data: {
                        email: parsedemail || undefined,
                        phoneNumber: parsedphoneNumber || undefined,
                        linkPrecedence: 'secondary',
                    }
                });
                linkedContacts.push(newContact);
            }
            const uniqueContacts = Array.from(new Map(linkedContacts.map(c => [c.id, c])).values());
            const sortedContacts = uniqueContacts.sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            const primaryContact = sortedContacts[0];
            const secondaryContactIds = sortedContacts.filter(c => c.id !== primaryContact.id).map(c => c.id);
            yield client.contact.updateMany({
                where: {
                    id: {
                        in: secondaryContactIds
                    }
                },
                data: {
                    linkPrecedence: 'secondary',
                    linkedId: primaryContact.id
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
        }
        catch (error) {
            console.error("Error processing identify request:", error);
            res.status(500).json({
                message: "An error occurred while processing the request",
                error
            });
        }
    });
}
