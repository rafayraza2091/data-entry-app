import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCachedPendingAttendance } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingDates = await getCachedPendingAttendance();
    return NextResponse.json(pendingDates);
  } catch (error: any) {
    console.error('Error fetching pending attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch pending attendance' }, { status: 500 });
  }
}
