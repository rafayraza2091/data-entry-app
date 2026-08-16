import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCachedPendingUsers } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OWNER' && session.role !== 'ASSISTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const pendingUsers = await getCachedPendingUsers();
    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
