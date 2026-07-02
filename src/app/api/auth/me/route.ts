import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let className = '';

    if (session.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: {
          firstName: session.firstName,
          secondName: session.lastName,
        }
      });
      if (student) {
        className = student.className;
      }
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        role: session.role,
        firstName: session.firstName,
        lastName: session.lastName,
        className,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch session details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
