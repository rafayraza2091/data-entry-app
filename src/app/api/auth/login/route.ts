import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.dataentryUser.findUnique({
      where: { username },
    });

    if (!user) {
      // Check if they are pending
      const pending = await prisma.pendingUser.findUnique({
        where: { username }
      });

      if (pending) {
        return NextResponse.json({ error: 'Your approval is still pending. Please ask the admin to approve your account.' }, { status: 403 });
      }

      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Set secure JWT cookie
    await setAuthCookie(user.id, user.username, user.role, user.firstName, user.lastName);

    return NextResponse.json({ success: true, message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
