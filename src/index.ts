import express from "express"
import { validateIdentityPayload } from "./middlewares/validateIdentityPayload"
import { identify } from "./routes/identify"

export const app = express()
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello, World!")
})

app.post("/identify",validateIdentityPayload, identify);