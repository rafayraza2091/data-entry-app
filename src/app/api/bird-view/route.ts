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

      // STRICT SECURITY: If requester is a student, ensure cellData only contains their own records
      if (isStudent && cellData.length > 0) {
        const studentFullName = `${session.firstName} ${session.lastName}`.trim().toLowerCase();
        if (viewType === 'task') {
          cellData = cellData.filter((t) => {
            const a = (t.assignee || '').trim().toLowerCase();
            const c = (t.createdBy || '').trim().toLowerCase();
            return a === studentFullName || c === studentFullName;
          });
        } else if (viewType === 'query') {
          cellData = cellData.filter((q) => {
            const s = (q.studentName || '').trim().toLowerCase();
            return s === studentFullName;
          });
        }
      }
    }

    return NextResponse.json({ subjects, students, cellData, attendanceData }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=120',
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
