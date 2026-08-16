import { NextResponse } from 'next/server';
import { getCachedTaskUsers } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCachedTaskUsers();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching task users:', error);
    return NextResponse.json({ error: 'Failed to fetch task users' }, { status: 500 });
  }
}
