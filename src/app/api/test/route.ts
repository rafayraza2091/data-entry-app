import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const res = await prisma.subjectEntry.create({ data: { name: 'Test' + Date.now() } });
    return NextResponse.json({ success: true, res });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
