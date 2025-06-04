"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const validateIdentityPayload_1 = require("./middlewares/validateIdentityPayload");
const identify_1 = require("./routes/identify");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.get("/", (req, res) => {
    res.send("Hello, World!");
});
exports.app.post("/identify", validateIdentityPayload_1.validateIdentityPayload, identify_1.identify);
