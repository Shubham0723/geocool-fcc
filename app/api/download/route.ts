import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get('url');
        const name = searchParams.get('name') || 'document';
        if (!url) {
            return NextResponse.json({ error: 'url is required' }, { status: 400 });
        }

        const upstream = await fetch(url);
        if (!upstream.ok) {
            return NextResponse.json({ error: 'Failed to fetch source' }, { status: upstream.status });
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await upstream.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${name}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Download failed', details: e?.message }, { status: 500 });
    }
}


