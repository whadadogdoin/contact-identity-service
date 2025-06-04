import {z} from 'zod';
import { Request,NextFunction, Response } from 'express';

const identitySchema = z
.object({
    email: z.string().email().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
})
.refine(data => data.email || data.phoneNumber, {
    message: 'At least one of email or phoneNumber must be provided',
});

export const validateIdentityPayload = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedInput = identitySchema.parse(req.body);
        console.log('Parsed Input:', parsedInput);
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid request payload', error });
    }
};