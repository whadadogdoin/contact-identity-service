"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdentityPayload = void 0;
const zod_1 = require("zod");
const identitySchema = zod_1.z
    .object({
    email: zod_1.z.string().email().optional().nullable(),
    phoneNumber: zod_1.z.string().optional().nullable(),
})
    .refine(data => data.email || data.phoneNumber, {
    message: 'At least one of email or phoneNumber must be provided',
});
const validateIdentityPayload = (req, res, next) => {
    try {
        const parsedInput = identitySchema.parse(req.body);
        console.log('Parsed Input:', parsedInput);
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid request payload', error });
    }
};
exports.validateIdentityPayload = validateIdentityPayload;
