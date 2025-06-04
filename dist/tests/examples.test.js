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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const __1 = require("..");
const supertest_1 = __importDefault(require("supertest"));
const reset_db_1 = __importDefault(require("./helpers/reset-db"));
let primaryContactId;
(0, vitest_1.describe)("POST /identify", () => {
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Clearing DB");
        yield (0, reset_db_1.default)();
    }));
    (0, vitest_1.it)("should create a new contact with email and phoneNumber", () => __awaiter(void 0, void 0, void 0, function* () {
        const { status, body } = yield (0, supertest_1.default)(__1.app).post("/identify").send({
            email: "lorraine@hillvalley.edu",
            phoneNumber: "123456"
        });
        (0, vitest_1.expect)(status).toBe(200);
        (0, vitest_1.expect)(body).toEqual({
            contact: {
                primaryContactId: vitest_1.expect.any(Number),
                emails: ["lorraine@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: []
            }
        });
        primaryContactId = body.contact.primaryContactId;
    }));
    (0, vitest_1.it)("should return the same primary contact when queried with email only", () => __awaiter(void 0, void 0, void 0, function* () {
        const { status, body } = yield (0, supertest_1.default)(__1.app).post("/identify").send({
            email: "lorraine@hillvalley.edu",
            phoneNumber: null
        });
        (0, vitest_1.expect)(status).toBe(200);
        (0, vitest_1.expect)(body.contact.primaryContactId).toBe(primaryContactId);
        (0, vitest_1.expect)(body).toEqual({
            contact: {
                primaryContactId: vitest_1.expect.any(Number),
                emails: ["lorraine@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: [vitest_1.expect.any(Number)]
            }
        });
    }));
});
