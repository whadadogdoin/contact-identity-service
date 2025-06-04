import { describe,expect,it,beforeAll} from "vitest";
import { app } from "..";
import request from "supertest";
import resetDatabase from "./helpers/reset-db";

let primaryContactId: number

describe("POST /identify", () => {
    beforeAll(async () => {
        console.log("Clearing DB");
        await resetDatabase()
    })
    
    it("should create a new contact with email and phoneNumber", async () => {
        const {status, body}= await request(app).post("/identify").send({
            email: "lorraine@hillvalley.edu",
            phoneNumber: "123456"
        })
        expect(status).toBe(200);
        expect(body).toEqual({
            contact: {
                primaryContactId: expect.any(Number),
                emails: ["lorraine@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: []
            }
        })
        primaryContactId = body.contact.primaryContactId;
    })

    it("should return the same primary contact when queried with email only", async () =>  {
        const {status, body} = await request(app).post("/identify").send({
            email: "lorraine@hillvalley.edu",
            phoneNumber: null
        })
        expect(status).toBe(200);
        expect(body.contact.primaryContactId).toBe(primaryContactId);
        expect(body).toEqual({
            contact: {
                primaryContactId: expect.any(Number),
                emails: ["lorraine@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: []
            }
        })
    })
})