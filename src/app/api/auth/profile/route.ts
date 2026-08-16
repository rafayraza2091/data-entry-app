import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, setAuthCookie } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    
    // Strict Authorization: ONLY the Owner can change their name
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden: Only the Owner can change their profile name.' },
        { status: 403 }
      );
    }

    const { firstName, lastName = '' } = await request.json();

    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required.' },
        { status: 400 }
      );
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = (lastName || '').trim();

    // 1. Update dataentryUser
    const updatedUser = await prisma.dataentryUser.update({
      where: { id: session.userId },
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
      },
    });

    // 2. Update Admin record if it exists
    await prisma.admin.updateMany({
      where: { userId: session.userId },
      data: {
        firstName: cleanFirstName,
        secondName: cleanLastName,
      },
    }).catch(() => {});

    // 3. Update active session cookie so the UI updates immediately
    await setAuthCookie(
      session.userId,
      session.username,
      session.role,
      cleanFirstName,
      cleanLastName
    );

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
