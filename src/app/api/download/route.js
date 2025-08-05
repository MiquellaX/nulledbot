import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'nulledbot.zip');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename=nulledbot.zip',
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
