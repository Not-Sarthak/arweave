import express from "express";
import { readFileSync } from "node:fs";
import { result, message, createDataItemSigner } from "@permaweb/aoconnect";

const wallet = JSON.parse(readFileSync("../wallet.json").toString());

const PORT = 3000;
const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    const msg = await message({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        data: "ping",
        signer: createDataItemSigner(wallet),
    });

    return res.send({ data: msg })
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})