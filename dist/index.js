"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateIdentityPayload_1 = require("./middlewares/validateIdentityPayload");
const identify_1 = require("./routes/identify");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.post("/identify", validateIdentityPayload_1.validateIdentityPayload, identify_1.identify);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
