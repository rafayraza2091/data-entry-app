import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { role } = await request.json();
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Prevent OWNER from changing their own role to avoid lockout
    if (userId === session.userId && role !== 'OWNER') {
      return NextResponse.json({ error: 'You cannot demote yourself from OWNER' }, { status: 403 });
    }

    // Get old user to know their previous role
    const oldUser = await prisma.dataentryUser.findUnique({
      where: { id: userId }
    });

    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = oldUser.role;

    const updatedUser = await prisma.dataentryUser.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });

    // Determine tables based on roles
    const getTableName = (r: string) => {
      if (r === 'STUDENT') return 'student';
      if (['TEACHER', 'ASSISTANT'].includes(r)) return 'teacher';
      if (['OWNER', 'COORDINATOR'].includes(r)) return 'admin';
      return null;
    };

    const oldTable = getTableName(oldRole);
    const newTable = getTableName(role);

    // If the table changed, delete from old and insert into new
    if (oldTable !== newTable) {
      // 1. Try to delete from old table if they existed
      if (oldTable) {
        try {
          await (prisma as any)[oldTable].delete({
            where: { userId: userId }
          });
        } catch (err) {
          // It's possible the user wasn't in the old table (e.g. legacy data)
          console.warn(`Could not delete user ${userId} from ${oldTable}`);
        }
      }

      // 2. Insert into new table
      if (newTable) {
        const baseData = {
          userId: userId,
          firstName: updatedUser.firstName,
          secondName: updatedUser.lastName,
          address: "N/A",
          mobileNumber: "N/A",
          email: "",
        };

        // Student table has extra required fields
        const tableData = newTable === 'student' 
          ? { ...baseData, className: "N/A", schoolName: "N/A" } 
          : baseData;

        try {
          await (prisma as any)[newTable].create({
            data: tableData
          });
        } catch (err) {
          console.error(`Could not insert user ${userId} into ${newTable}`, err);
        }
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
