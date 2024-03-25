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

app.post('/register', async (req, res) => {
    const msg = await message({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer: createDataItemSigner(wallet),
        tags: [
            { name: 'Action', value: 'Register' }
        ]
    });

    let { Messages, Spawns, Output, Error } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
    });

    console.log(Messages[0].Data);
    return res.send({ data: Messages[0].Data });
})

app.post('/send', async (req, res) => {
    const messageText = req.body.message;
    const msg = await message({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        data: messageText,
        signer: createDataItemSigner(wallet),
        tags: [
            { name: 'Action', value: 'Broadcast' }
        ]
    });

    let { Messages, Spawns, Output, Error } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
    });

    console.log(Messages[0].Data);
    return res.send({ data: Messages[0].Data });
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})