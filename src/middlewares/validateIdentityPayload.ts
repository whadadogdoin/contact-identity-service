import {z} from 'zod';
import { Request,NextFunction, Response } from 'express';

const identitySchema = z
.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
})
.refine(data => data.email || data.phoneNumber, {
    message: 'At least one of email or phoneNumber must be provided',
});

export const validateIdentityPayload = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedInput = identitySchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid request payload', error });
    }
};