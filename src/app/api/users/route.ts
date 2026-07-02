import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { category, username, password, confirmPassword, ...userData } = data;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Handle account creation
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required for account creation' }, { status: 400 });
    }

    const existingUser = await prisma.dataentryUser.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    let role = 'STUDENT';
    if (category === 'teacher') role = 'TEACHER';
    else if (category === 'admin') role = 'COORDINATOR'; // Map Admin to COORDINATOR

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.dataentryUser.create({
      data: {
        username,
        password: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.secondName || '',
        role: role as any,
      }
    });

    // Now create the actual category record
    if (category === 'student') {
      const student = await prisma.student.create({
        data: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          address: userData.address,
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          fatherName: userData.fatherName,
          parentContact1: userData.parentContact1,
          parentContact2: userData.parentContact2,
          otherInfo: userData.otherInfo,
          className: userData.class,
          schoolName: userData.schoolName,
        },
      });
      return NextResponse.json(student, { status: 201 });
    } else if (category === 'teacher') {
      const teacher = await prisma.teacher.create({
        data: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          address: userData.address,
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          fatherName: userData.fatherName,
          parentContact1: userData.parentContact1,
          parentContact2: userData.parentContact2,
          otherInfo: userData.otherInfo,
        },
      });
      return NextResponse.json(teacher, { status: 201 });
    } else if (category === 'admin') {
      const admin = await prisma.admin.create({
        data: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          address: userData.address,
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          fatherName: userData.fatherName,
          parentContact1: userData.parentContact1,
          parentContact2: userData.parentContact2,
          otherInfo: userData.otherInfo,
        },
      });
      return NextResponse.json(admin, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ students, teachers, admins }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { category, id, ...updateData } = data;

    if (!category || !id) {
      return NextResponse.json({ error: 'Category and ID are required' }, { status: 400 });
    }

    let updatedRecord;

    if (category === 'student') {
      updatedRecord = await prisma.student.update({
        where: { id: Number(id) },
        data: updateData
      });
    } else if (category === 'teacher') {
      updatedRecord = await prisma.teacher.update({
        where: { id: Number(id) },
        data: updateData
      });
    } else if (category === 'admin') {
      updatedRecord = await prisma.admin.update({
        where: { id: Number(id) },
        data: updateData
      });
    } else {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ success: true, updatedRecord }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 });
  }
}
