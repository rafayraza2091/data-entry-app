import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subjects = await prisma.subjectEntry.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      }
    });

    let students;
    if (session.role === 'STUDENT') {
      students = await prisma.$queryRaw`
        SELECT id, "firstName", "secondName", subjects 
        FROM "Student" 
        WHERE status = 'Active' 
        AND "firstName" = ${session.firstName} 
        AND "secondName" = ${session.lastName} 
        ORDER BY "firstName" ASC
      `;
    } else {
      students = await prisma.$queryRaw`
        SELECT id, "firstName", "secondName", subjects 
        FROM "Student" 
        WHERE status = 'Active' 
        ORDER BY "firstName" ASC
      `;
    }

    return NextResponse.json({ subjects, students });
    } catch (error: any) {
      console.error('Error fetching bird view data:', error);
      try {
        require('fs').writeFileSync('/tmp/bird-view-error.log', error.message || String(error));
      } catch(e) {}
      return NextResponse.json(
        { error: 'Failed to fetch bird view data' },
        { status: 500 }
      );
  } finally {
    await prisma.$disconnect();
  }
}
