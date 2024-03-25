import express from "express";
import cors from "cors";
import { readFileSync } from "node:fs";
import { result, message, createDataItemSigner } from "@permaweb/aoconnect";

const wallet = JSON.parse(readFileSync("../wallet.json").toString());

const PORT = 4000;
const app = express();

app.use(express.json());
app.use(cors());

app.post('/', async (req, res) => {
    console.log(req.body.message);
    const msg = await message({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        data: "ping",
        signer: createDataItemSigner(wallet),
    });
    console.log(msg);

    return res.send({ data: msg })
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})