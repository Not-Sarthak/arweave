import { readFileSync } from "node:fs";
import { result, message, createDataItemSigner } from "@permaweb/aoconnect";
import { NextRequest, NextResponse } from "next/server";

const wallet = JSON.parse(readFileSync("wallet.json").toString());

export async function GET(req: NextRequest) {
    try {
        const msg = await message({
            process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
            signer: createDataItemSigner(wallet),
            tags: [
                { name: 'Action', value: 'Get-Latest-Messages' }
            ]
        });
        console.log(msg)

        let { Messages, Spawns, Output, Error } = await result({
            message: msg,
            process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        });
        console.log(Messages);

        return NextResponse.json({ data: Messages[0].Data }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "There was an Error" }, { status: 500 });
    }
}