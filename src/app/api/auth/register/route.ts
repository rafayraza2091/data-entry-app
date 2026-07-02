import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { 
      firstName, 
      lastName, 
      username, 
      password, 
      confirmPassword,
      email = "",
      contactNumber = "N/A",
      address = "N/A",
      designation = "student",
      fatherName = "",
      parentContact1 = "",
      parentContact2 = ""
    } = await request.json();

    if (!firstName || !lastName || !username || !password || !confirmPassword || !designation) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const existingUser = await prisma.dataentryUser.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.pendingUser.create({
      data: {
        firstName,
        lastName,
        username,
        password: hashedPassword,
        email,
        contactNumber,
        address,
        designation: designation || "student",
        fatherName,
        parentContact1,
        parentContact2,
      },
    });

    return NextResponse.json({ success: true, message: 'Registration submitted for approval' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
