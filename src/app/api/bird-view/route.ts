import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getCachedSubjects,
  getCachedBirdViewStudents,
  getCachedAttendanceByDate,
  getCachedBirdViewTasks,
  getCachedBirdViewQueries,
} from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const viewType = searchParams.get('view'); // 'task' or 'query'
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isStudent = session.role === 'STUDENT';
    const [subjects, students] = await Promise.all([
      getCachedSubjects(),
      getCachedBirdViewStudents(isStudent, session.firstName, session.lastName),
    ]);

    let cellData: any[] = [];
    let attendanceData: any[] = [];
    
    if (dateStr) {
      const attendancePromise = getCachedAttendanceByDate(dateStr);
      let dataPromise: Promise<any[]> = Promise.resolve([]);

      if (viewType === 'task') {
        dataPromise = getCachedBirdViewTasks(dateStr);
      } else if (viewType === 'query') {
        dataPromise = getCachedBirdViewQueries(dateStr);
      }

      const [att, cd] = await Promise.all([attendancePromise, dataPromise]);
      attendanceData = att;
      cellData = cd;
    }

    return NextResponse.json({ subjects, students, cellData, attendanceData }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error fetching bird view data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bird view data', details: error.message },
      { status: 500 }
    );
  }
}
