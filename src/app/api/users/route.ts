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

    const newUser = await prisma.dataentryUser.create({
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
      const res = await prisma.$queryRaw`
        INSERT INTO "Student" (
          "userId", "firstName", "secondName", "address", "mobileNumber", "email",
          "fatherName", "parentContact1", "parentContact2", "otherInfo",
          "className", "schoolName", "status", "subjects",
          "createdAt", "updatedAt"
        ) VALUES (
          ${newUser.id}, ${userData.firstName}, ${userData.secondName}, ${userData.address}, ${userData.mobileNumber}, ${userData.email},
          ${userData.fatherName || null}, ${userData.parentContact1 || null}, ${userData.parentContact2 || null}, ${userData.otherInfo || null},
          ${userData.class}, ${userData.schoolName}, ${userData.status || 'Active'}, ${userData.subjects || []},
          NOW(), NOW()
        ) RETURNING *
      `;
      const student = Array.isArray(res) ? res[0] : res;
      return NextResponse.json(student, { status: 201 });
    } else if (category === 'teacher') {
      const teacher = await prisma.teacher.create({
        data: {
          userId: newUser.id,
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
          userId: newUser.id,
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
    const [students, teachers, admins] = await Promise.all([
      prisma.$queryRaw`SELECT * FROM "Student" ORDER BY "createdAt" DESC`,
      prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.admin.findMany({ orderBy: { createdAt: 'desc' } })
    ]); return NextResponse.json({ students, teachers, admins }, { status: 200 });
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
      updatedRecord = await prisma.$executeRaw`
        UPDATE "Student"
        SET "firstName" = ${updateData.firstName},
            "secondName" = ${updateData.secondName},
            "address" = ${updateData.address},
            "mobileNumber" = ${updateData.mobileNumber},
            "email" = ${updateData.email},
            "fatherName" = ${updateData.fatherName},
            "parentContact1" = ${updateData.parentContact1},
            "parentContact2" = ${updateData.parentContact2},
            "otherInfo" = ${updateData.otherInfo},
            "className" = ${updateData.className},
            "schoolName" = ${updateData.schoolName},
            "status" = ${updateData.status},
            "subjects" = ${updateData.subjects}
        WHERE id = ${Number(id)}
      `;
    } else if (category === 'teacher') {
      updatedRecord = await prisma.teacher.update({
        where: { id: Number(id) },
        data: {
          firstName: updateData.firstName,
          secondName: updateData.secondName,
          address: updateData.address,
          mobileNumber: updateData.mobileNumber,
          email: updateData.email,
          fatherName: updateData.fatherName,
          parentContact1: updateData.parentContact1,
          parentContact2: updateData.parentContact2,
          otherInfo: updateData.otherInfo,
        }
      });
    } else if (category === 'admin') {
      updatedRecord = await prisma.admin.update({
        where: { id: Number(id) },
        data: {
          firstName: updateData.firstName,
          secondName: updateData.secondName,
          address: updateData.address,
          mobileNumber: updateData.mobileNumber,
          email: updateData.email,
          fatherName: updateData.fatherName,
          parentContact1: updateData.parentContact1,
          parentContact2: updateData.parentContact2,
          otherInfo: updateData.otherInfo,
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ success: true, updatedRecord }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    try {
      require('fs').writeFileSync('/tmp/prisma-update-error.log', JSON.stringify({
        message: error.message,
        stack: error.stack
      }, null, 2));
    } catch(e) {}
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 });
  }
}
